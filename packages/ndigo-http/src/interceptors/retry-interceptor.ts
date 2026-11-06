/**
 */
import { HTTPInit, HTTPMethod, ErrorAwareHTTPInterceptor, RequestAwareHTTPInterceptor, HTTP } from '../http';
import ResponseError from '../response-error';

/**
 * Configuration options for the retry interceptor.
 */
export type RetryInit = HTTPInit & {
    /**
     * The maximum number of retry attempts.
     * @defaultValue 0
     */
    retryLimit?: number;

    /**
     * The fixed interval (in seconds, 1–120) to wait between retries.
     * @defaultValue 0
     */
    retryBufferInterval?: number;

    /**
     * Response header whose value (in seconds) overrides `retryBufferInterval`.
     * Commonly set to `'Retry-After'`.
     */
    retryHeader?: string;

    /**
     * HTTP status codes that are eligible for retry.
     * Defaults to the transient/retryable set (`408`, `429`, `500`, `502`,
     * `503`, `504`). An explicit empty array means every status is eligible.
     */
    retryStatusCodes?: number[];

    /**
     * HTTP methods that are eligible for retry.
     * Defaults to the idempotent set (RFC 9110 §9.2.2): `GET`, `HEAD`,
     * `OPTIONS`, `PUT`, `DELETE`, `TRACE`. Replaying a non-idempotent request
     * (e.g. `POST`) is opt-in. An explicit empty array means every method is
     * eligible.
     */
    retryMethods?: HTTPMethod[];
};

/**
 * Methods retried by default: the idempotent set from RFC 9110 §9.2.2. A
 * retried non-idempotent request can duplicate a side effect, so it is opt-in
 * via {@link RetryInit.retryMethods}.
 */
const IDEMPOTENT_METHODS: HTTPMethod[] = ['GET', 'HEAD', 'OPTIONS', 'PUT', 'DELETE', 'TRACE'];

/**
 * Status codes retried by default: the transient/retryable responses
 * (timeout, rate limiting, and server-side failures).
 */
const RETRYABLE_STATUS_CODES = [408, 429, 500, 502, 503, 504];

/**
 * Out-of-band retry-attempt counter.
 *
 * It is stored on the per-request settings object rather than a request header:
 * the settings object is created once per `HTTP.request` call and survives the
 * `Request` rebuilds other interceptors perform, so the counter travels with
 * the request without ever going on the wire (and cannot be forged by a caller).
 *
 * @internal
 */
const RETRY_ATTEMPT = Symbol('ndigo.http.retry-attempt');

/** The per-request settings object carrying the internal retry counter. */
type RetrySettings = HTTPInit & { [RETRY_ATTEMPT]?: number };

/**
 * Minimal structural view of a scheduled timer handle: Node exposes `unref`,
 * the DOM does not. Casting the platform `setTimeout` result to this shape
 * keeps the backoff timer from pinning the event loop.
 */
interface ScheduledTimer {
    unref?: () => void;
}

/**
 * Retries failed HTTP requests up to a configurable limit.
 *
 * Retry state is keyed on the per-request settings object (threaded into
 * `preRequest`/`postError` by the execution chain) rather than on the `Request`
 * object, because other interceptors replace the `Request` before it reaches
 * fetch. The undisturbed body clone captured in `preRequest` and the attempt
 * counter both therefore survive `new Request(...)`.
 */
export class RetryInterceptor implements ErrorAwareHTTPInterceptor, RequestAwareHTTPInterceptor {
    readonly #config: RetryInit;
    /**
     * Undisturbed `Request.clone()` per live request, captured in
     * `preRequest` before fetch reads the body stream. The failed request's
     * body is consumed/disturbed by the time `postError` runs, so a retry
     * must be rebuilt from this clone to keep the original payload. Keyed on
     * the per-request settings object so it survives request replacement.
     */
    readonly #pristineClones = new WeakMap<object, Request>();

    /**
     * Creates a new retry interceptor.
     *
     * @param config - Retry configuration.  All fields are optional and
     *   default to the most conservative behaviour (zero retries, idempotent
     *   methods, retryable statuses only).
     */
    constructor(config: RetryInit = {}) {
        this.#config = config;
    }

    /**
     * Captures an undisturbed clone of each outgoing request so a later
     * retry can re-issue it with the original body intact.
     *
     * @param request - The request being sent.
     * @param http - The HTTP client executing the request.
     * @param settings - The per-request settings object used as the stable
     *   identity for the clone (falls back to the request itself when absent).
     * @returns Nothing; the request passes through unchanged.
     */
    async preRequest(request: Request, http: HTTP, settings?: HTTPInit): Promise<Request | void> {
        this.#pristineClones.set(settings ?? request, request.clone());
    }

    /**
     * Potentially retries the failed request according to the configured policy.
     *
     * Returns `undefined` (letting the error propagate) when:
     * - `retryLimit` is 0 or unset
     * - The attempt ceiling has already been reached
     * - The request method is not retryable
     * - The response status is not retryable
     * - The caller has already aborted the request
     *
     * @param error - The error thrown during the request.
     * @param request - The original request object.
     * @param http - The owning HTTP client used to issue the retry.
     * @param settings - The per-request settings object carrying the stable
     *   retry identity and the out-of-band attempt counter.
     * @returns A promise that resolves to the retried response, or `undefined`.
     */
    async postError(error: Error, request: Request, http: HTTP, settings?: HTTPInit): Promise<Response | undefined> {
        const responseError = error as ResponseError;

        if (!(responseError instanceof ResponseError) || !this.#shouldRetryStatus(responseError.status)) {
            return undefined;
        }

        const retryLimit = this.#config.retryLimit ?? 0;
        if (retryLimit <= 0) {
            return undefined;
        }

        // The clone captured in preRequest is keyed by the settings object,
        // which is stable across the Request rebuilds other interceptors do.
        const base = this.#pristineClones.get(settings ?? request) ?? request;

        if (!this.#shouldRetryMethod(base.method)) {
            return undefined;
        }

        // The attempt counter travels out of band on the settings object, so
        // it survives each retry's new Request without a wire header.
        // Reason for the cast: the symbol key is internal to this module.
        const retrySettings = settings as RetrySettings | undefined;
        const currentAttempt = retrySettings?.[RETRY_ATTEMPT] ?? 0;
        if (currentAttempt >= retryLimit) {
            return undefined;
        }

        // A caller cancellation is final: never issue a retry for an aborted request.
        if (request.signal.aborted) {
            return undefined;
        }

        // Determine buffer interval — prefer the response header when available.
        let bufferInterval = this.#config.retryBufferInterval ?? 0;

        if (this.#config.retryHeader && responseError.headers) {
            const headerValue = responseError.headers.get(this.#config.retryHeader);
            if (headerValue !== null) {
                const parsed = parseInt(headerValue, 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= 120) {
                    bufferInterval = parsed;
                }
            }
        }

        return new Promise<Response>((resolve, reject) => {
            const signal = request.signal;
            let timer: ScheduledTimer | undefined;

            // An abort during the backoff window cancels the pending retry:
            // clear the timer so no request is issued, and surface the abort.
            const onAbort = (): void => {
                clearTimeout(timer as unknown as number);
                const reason = signal.reason;
                reject(reason instanceof Error ? reason : new DOMException('The operation was aborted.', 'AbortError'));
            };

            signal.addEventListener('abort', onAbort, { once: true });

            timer = setTimeout(async () => {
                signal.removeEventListener('abort', onAbort);
                try {
                    // Rebuild from the undisturbed clone captured in
                    // preRequest — the live request's body was already read
                    // by the failed attempt, so cloning it here would throw.
                    const retryInit: RetryInit & { duplex?: 'half' } = {
                        method: base.method as RetryInit['method'],
                        headers: new Headers(base.headers),
                        body: base.body,
                        // Node's fetch refuses to send a ReadableStream body
                        // (the clone's) without an explicit half-duplex mode.
                        duplex: base.body !== null ? 'half' : undefined,
                        mode: base.mode,
                        credentials: base.credentials,
                        cache: base.cache,
                        redirect: base.redirect,
                        referrer: base.referrer,
                        referrerPolicy: base.referrerPolicy,
                        integrity: base.integrity,
                        // Forward the caller's signal so cancellation is
                        // honored across the retry as well.
                        signal,
                    };
                    // Reason for the cast: the symbol key is internal to this module.
                    const seeded = retryInit as RetrySettings;
                    seeded[RETRY_ATTEMPT] = currentAttempt + 1;

                    const response = await http.request(base.url, retryInit);
                    resolve(response);
                } catch (retryError) {
                    reject(retryError);
                }
            }, bufferInterval * 1000) as unknown as ScheduledTimer;
            // Never keep the process alive for a pending backoff window.
            timer.unref?.();
        });
    }

    /**
     * Returns `true` when the given status code should trigger a retry.
     *
     * @param statusCode - The HTTP status code to evaluate.
     */
    #shouldRetryStatus(statusCode: number): boolean {
        const statuses = this.#config.retryStatusCodes ?? RETRYABLE_STATUS_CODES;
        if (statuses.length === 0) {
            return true;
        }
        return statuses.includes(statusCode);
    }

    /**
     * Returns `true` when the given method should trigger a retry.
     *
     * @param method - The HTTP method to evaluate.
     */
    #shouldRetryMethod(method: string): boolean {
        const methods = this.#config.retryMethods ?? IDEMPOTENT_METHODS;
        if (methods.length === 0) {
            return true;
        }
        return methods.includes(method.toUpperCase() as HTTPMethod);
    }
}
