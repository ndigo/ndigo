/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import ResponseError from '../response-error';
import { isNumber } from '@blue/util/types';
import {
    CompletionAwareHTTPInterceptor,
    ErrorAwareHTTPInterceptor,
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
 * Aborts slow requests and converts aborts into timeout responses.
 *
 * Each request gets its own timer keyed by its `AbortSignal`, so one
 * request settling (success or failure) never clears another request's
 * pending timeout. Only `AbortError` failures are translated into 408
 * responses — transport failures (DNS, TLS, CORS, TypeError) fall through
 * to other error-aware interceptors or propagate to the caller.
 */
export class TimeoutInterceptor
    implements
        InitializationAwareHTTPInterceptor<TimeoutInit>,
        ErrorAwareHTTPInterceptor,
        CompletionAwareHTTPInterceptor
{
    #timeouts = new Map<AbortSignal, TimeoutId>();

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
            fetchTimeout = () => controller.abort();

        settings.signal = controller.signal;
        settings.timeout = isPositiveNumber(settings.timeout) ? settings.timeout : this.timeout;

        // Track the timer per request signal so settling one request never
        // cancels another request's pending timeout.
        this.#timeouts.set(controller.signal, setTimeout(fetchTimeout, settings.timeout));
        return true;
    }

    /**
     * @param {Error} error The error that was thrown
     * @param {Request} request The HTTP request
     * @returns {Promise<external:Response | undefined>} A 408 response for
     *   aborted requests, or `undefined` so other error-aware interceptors
     *   can handle transport failures.
     */
    async postError(error: Error, request: Request): Promise<Response | undefined> {
        if (error.name !== 'AbortError') {
            // DNS/TLS/CORS/TypeError failures are not timeouts; let the rest
            // of the error-aware chain (and finally the caller) handle them.
            return undefined;
        }
        this._clearTimeout(request.signal);
        return new ResponseError(REQUEST_TIMEOUT.createResponse(''), error);
    }

    /**
     * @param {Request} request The HTTP request
     * @param {Response} response The HTTP response
     */
    postComplete(request: Request, response: Response): void {
        this._clearTimeout(request.signal);
    }

    private _clearTimeout(signal: AbortSignal): void {
        const timeoutId = this.#timeouts.get(signal);
        if (timeoutId !== undefined) {
            clearTimeout(timeoutId);
            this.#timeouts.delete(signal);
        }
    }
}
