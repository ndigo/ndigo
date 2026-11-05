/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
import { isNumber } from '@ndigo/util/types';
import {
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
    HTTP,
    HTTPInit,
    InitializationAwareHTTPInterceptor,
} from '../http';
import { REQUEST_TIMEOUT } from '../response-statuses';

/**
 * Request settings for {@link TimeoutInterceptor}.
 */
export type TimeoutInit = HTTPInit & { timeout?: number };

/**
 * Platform `setTimeout` handle — `number` in DOM environments,
 * `NodeJS.Timeout` under Node's typings.
 */
type TimeoutId = ReturnType<typeof setTimeout>;

const { defineProperty } = Reflect,
    { isInteger } = Number,
    greaterThanZero = (value: number): boolean => value > 0,
    isPositiveNumber = (value: unknown): value is number =>
        isNumber(value) && isInteger(value as number) && greaterThanZero(value);

/**
 * A live timeout: the controller its timer aborts and the platform handle.
 */
type TimeoutEntry = { controller: AbortController; timeoutId: TimeoutId };

/**
 * Abort reason identifying this interceptor's own timer. Its identity is what
 * separates a real timeout from an abort produced by the caller's signal, so
 * only the former becomes a 408 response.
 */
const TIMEOUT_REASON = new DOMException('The request timed out.', 'TimeoutError');

/**
 * Composes a caller-supplied abort signal with the timeout signal.
 *
 * Uses the platform `AbortSignal.any` when available; otherwise forwards
 * aborts manually so the timeout still cancels requests on older runtimes.
 */
function composeSignals(caller: AbortSignal | null | undefined, timeout: AbortSignal): AbortSignal {
    if (caller == null) {
        return timeout;
    }
    if (typeof AbortSignal.any === 'function') {
        return AbortSignal.any([caller, timeout]);
    }

    const controller = new AbortController();
    if (caller.aborted) {
        controller.abort(caller.reason);
    } else {
        caller.addEventListener('abort', () => controller.abort(caller.reason), { once: true });
        timeout.addEventListener('abort', () => controller.abort(timeout.reason), { once: true });
    }
    return controller.signal;
}

/**
 * Aborts slow requests and converts aborts into timeout responses.
 *
 * Each request gets its own timer, tracked against that request's settings so
 * settling one request never clears another request's pending timeout and no
 * timer outlives the request it belongs to. A caller-supplied `AbortSignal` is
 * composed with the timeout signal: caller aborts propagate as cancels, while
 * only this interceptor's own timer yields a 408. Transport failures (DNS,
 * TLS, CORS, TypeError) fall through to other error-aware interceptors or
 * propagate to the caller.
 */
export class TimeoutInterceptor
    implements
        InitializationAwareHTTPInterceptor<TimeoutInit>,
        ErrorAwareHTTPInterceptor,
        CompletionAwareHTTPInterceptor
{
    /**
     * Live timers keyed by the settings object the pipeline hands to
     * `preInit` and `postComplete` — the only identity that survives request
     * replacement by other interceptors.
     */
    #timeouts = new WeakMap<HTTPInit, TimeoutEntry>();

    readonly timeout!: number;

    constructor(timeout: number) {
        if (!isPositiveNumber(timeout)) {
            throw new TypeError(`timeout must be a positive integer`);
        }

        /**
         * @readonly
         */
        defineProperty(this, 'timeout', {
            get: () => timeout,
            configurable: true,
            enumerable: true,
        });
    }

    /**
     * @param {URL} url The requested URL.
     * @param {module:http.TimeoutInit} settings The HTTP request settings, including the `timeout` setting.
     * @returns {boolean} Whether or not the http request should continue execution.
     */
    preInit(url: URL, settings: TimeoutInit): boolean {
        const controller = new AbortController(),
            fetchTimeout = () => {
                // The timer has fired: drop the live entry before aborting so
                // a settled request never leaves it behind.
                this.#timeouts.delete(settings);
                controller.abort(TIMEOUT_REASON);
            };

        settings.timeout = isPositiveNumber(settings.timeout) ? settings.timeout : this.timeout;
        settings.signal = composeSignals(settings.signal, controller.signal);

        // Track the timer per request settings so settling one request never
        // cancels another request's pending timeout.
        const timeoutId = setTimeout(fetchTimeout, settings.timeout);
        // Never let a pending timeout keep the process alive (HTT-REV-009).
        // The DOM's numeric handle has no `unref`; Node's does.
        const scheduled = timeoutId as { unref?: () => void };
        scheduled.unref?.();
        this.#timeouts.set(settings, { controller, timeoutId });
        return true;
    }

    /**
     * @param {Error} error The error that was thrown
     * @param {Request} request The HTTP request
     * @param {module:http.HTTP} http The HTTP client executing the request
     * @param {module:http.HTTPInit} [settings] The per-request settings, used to
     *   release the timer on the error exit path (which never reaches
     *   `postComplete` when a later error-aware interceptor throws).
     * @returns {Promise<external:Response | undefined>} A 408 response for
     *   timed-out requests, or `undefined` so other error-aware interceptors
     *   (and finally the caller) can handle cancels and transport failures.
     */
    async postError(error: Error, request: Request, http: HTTP, settings?: HTTPInit): Promise<Response | undefined> {
        // The request settled with an error; its timer is no longer needed.
        if (settings !== undefined) {
            this._clearTimeout(settings);
        }

        const timedOut = request.signal.reason === TIMEOUT_REASON || error === TIMEOUT_REASON;

        if (!timedOut) {
            // A caller-level abort is a cancel, not a timeout; DNS/TLS/CORS/
            // TypeError failures are not timeouts either. Let the rest of the
            // error-aware chain handle them.
            if (error.name !== 'AbortError' || request.signal.aborted) {
                return undefined;
            }
        }

        return new ResponseError(REQUEST_TIMEOUT.createResponse(''), error);
    }

    /**
     * @param {Request} request The HTTP request
     * @param {Response} response The HTTP response
     * @param {module:http.HTTPInit} [settings] The settings the request was prepared from
     */
    postComplete(request: Request, response: Response, settings?: HTTPInit): void {
        if (settings !== undefined) {
            this._clearTimeout(settings);
        }
    }

    private _clearTimeout(settings: HTTPInit): void {
        const entry = this.#timeouts.get(settings);
        if (entry !== undefined) {
            clearTimeout(entry.timeoutId);
            this.#timeouts.delete(settings);
        }
    }
}
