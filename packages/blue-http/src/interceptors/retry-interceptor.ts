/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTPInit, ErrorAwareHTTPInterceptor, HTTP } from '../http';
import ResponseError from '../response-error';

/**
 * Configuration options for the retry interceptor.
 */
export type RetryInit = HTTPInit & {
    /**
     * The maximum number of retry attempts.
     * @default 0
     */
    retryLimit?: number;

    /**
     * The fixed interval (in seconds, 1–120) to wait between retries.
     * @default 0
     */
    retryBufferInterval?: number;

    /**
     * Response header whose value (in seconds) overrides `retryBufferInterval`.
     * Commonly set to `'Retry-After'`.
     */
    retryHeader?: string;

    /**
     * HTTP status codes that are eligible for retry.
     * When empty or absent, all failing status codes are eligible.
     */
    retryStatusCodes?: number[];
};

/**
 * Header name used internally to carry the retry-attempt counter across
 * requests so the WeakMap key problem (each retry creates a new Request)
 * is avoided without any per-instance mutable state.
 *
 * @internal
 */
const RETRY_ATTEMPT_HEADER = 'x-retry-attempt';

/**
 * Retries failed HTTP requests up to a configurable limit.
 *
 * Retry state is tracked via the `x-retry-attempt` request header rather
 * than a WeakMap so that the counter survives across the new `Request`
 * objects created on each retry call.
 *

 */
export class RetryInterceptor implements ErrorAwareHTTPInterceptor {
    readonly #config: RetryInit;

    /**
     * Creates a new retry interceptor.
     *
     * @param config - Retry configuration.  All fields are optional and
     *   default to the most conservative behaviour (zero retries).
     */
    constructor(config: RetryInit = {}) {
        this.#config = config;
    }

    /**
     * Potentially retries the failed request according to the configured policy.
     *
     * Returns `undefined` (letting the error propagate) when:
     * - `retryLimit` is 0 or unset
     * - The attempt ceiling has already been reached
     * - The response status is not in `retryStatusCodes` (when that list is non-empty)
     *
     * @param error - The error thrown during the request.
     * @param request - The original request object.
     * @param http - The owning HTTP client used to issue the retry.
     * @returns A promise that resolves to the retried response, or `undefined`.
     */
    async postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        const responseError = error as ResponseError;

        if (!(responseError instanceof ResponseError) || !this.#shouldRetryStatus(responseError.status)) {
            return undefined;
        }

        const retryLimit = this.#config.retryLimit ?? 0;
        if (retryLimit <= 0) {
            return undefined;
        }

        // Read attempt count from the header so the counter survives across
        // the new Request objects created by each http.request() call.
        const currentAttempt = parseInt(request.headers.get(RETRY_ATTEMPT_HEADER) ?? '0', 10);
        if (currentAttempt >= retryLimit) {
            return undefined;
        }

        // Determine buffer interval — prefer the response header when available.
        let bufferInterval = this.#config.retryBufferInterval ?? 0;

        if (this.#config.retryHeader && responseError.headers) {
            const headerValue = responseError.headers.get(this.#config.retryHeader);
            if (headerValue !== null) {
                // Fix the typo from the legacy code: pasrseInt → parseInt
                const parsed = parseInt(headerValue, 10);
                if (!isNaN(parsed) && parsed >= 1 && parsed <= 120) {
                    bufferInterval = parsed;
                }
            }
        }

        return new Promise<Response>((resolve, reject) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            setTimeout(async () => {
                try {
                    // Copy all headers and increment the attempt counter.
                    const retryHeaders = new Headers(request.headers);
                    retryHeaders.set(RETRY_ATTEMPT_HEADER, String(currentAttempt + 1));

                    const response = await http.request(request.url, {
                        method: request.method as RetryInit['method'],
                        headers: retryHeaders,
                        mode: request.mode,
                        credentials: request.credentials,
                        cache: request.cache,
                        redirect: request.redirect,
                        referrer: request.referrer,
                        referrerPolicy: request.referrerPolicy,
                        integrity: request.integrity,
                    });
                    resolve(response);
                } catch (retryError) {
                    reject(retryError);
                }
            }, bufferInterval * 1000); // convert seconds → milliseconds
        });
    }

    /**
     * Returns `true` when the given status code should trigger a retry.
     *
     * If `retryStatusCodes` is empty or absent, all status codes are eligible.
     *
     * @param statusCode - The HTTP status code to evaluate.
     */
    #shouldRetryStatus(statusCode: number): boolean {
        const { retryStatusCodes } = this.#config;
        if (!retryStatusCodes || retryStatusCodes.length === 0) {
            return true;
        }
        return retryStatusCodes.includes(statusCode);
    }
}
