/**
 * @module blue-http
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTP, HTTPInit, ResponseAwareHTTPInterceptor, ErrorAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

const { defineProperty } = Reflect;

/**
 * Configuration options for the ErrorNormalizationInterceptor.
 */
export interface ErrorNormalizationInterceptorConfig {
    /**
     * The default error type to use when a specific type cannot be determined.
     * @default 'HTTP_ERROR'
     */
    defaultErrorType?: string;
}

/**
 * HTTP interceptor that standardizes error responses into a consistent shape.
 *
 * This interceptor ensures that both network-level failures and HTTP error
 * responses are normalized into a consistent format for the application.
 *


 */
export class ErrorNormalizationInterceptor implements ResponseAwareHTTPInterceptor, ErrorAwareHTTPInterceptor {
    #config: ErrorNormalizationInterceptorConfig;

    /**
     * Creates a new error normalization interceptor.
     *
     * @param config - Error normalization configuration.
     */
    constructor(config: ErrorNormalizationInterceptorConfig = {}) {
        this.#config = config;
    }

    /**
     * Normalizes HTTP error responses (status codes outside 200-299).
     *
     * @param response - The response to normalize.
     * @param settings - The request settings used for the call.
     * @returns A normalized response or void.
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        if (response.ok) {
            return response;
        }

        // If it's not OK, we wrap it in a ResponseError if it isn't already
        // Note: NotOKInterceptor usually does this, but we ensure it here.
        throw new ResponseError(response, `HTTP Error: ${response.status} ${response.statusText}`);
    }

    /**
     * Normalizes transport or network errors.
     *
     * @param error - The failure that interrupted request execution.
     * @param request - The request that failed.
     * @param http - The HTTP client executing the request.
     * @returns A normalized response or undefined.
     */
    async postError(error: Error, request: Request, http: HTTP): Promise<Response | undefined> {
        // Cancellation and timeouts are control flow, not network failures:
        // leave them for the rest of the error-aware chain (e.g. the
        // TimeoutInterceptor) so an abort is never relabeled a network error
        // (HTT-REV-008).
        if (error.name === 'AbortError' || error.name === 'TimeoutError') {
            return undefined;
        }

        if (error instanceof ResponseError) {
            return undefined;
        }

        // Normalize network errors (e.g., TypeError: Failed to fetch).
        // The hook contract is "return a replacement response or undefined";
        // throwing would preempt the later error-aware interceptors. A
        // `ResponseError` is itself a `Response`, so returning it normalizes
        // the failure for the caller while letting the chain continue.
        const type = this.#config.defaultErrorType ?? 'NETWORK_ERROR';
        const normalized = new Error(type, { cause: error });
        normalized.stack = error.stack;
        const responseError = new ResponseError(undefined, normalized);
        // Preserve the original failure as the `cause` of the surfaced error.
        defineProperty(responseError, 'cause', { value: error, configurable: true });
        return responseError as unknown as Response;
    }
}
