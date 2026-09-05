import { HTTP, ResponseAwareHTTPInterceptor, ErrorAwareHTTPInterceptor } from '../http';
import ResponseError from '../response-error';

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
    async postResponse(response: Response, settings: any): Promise<Response | void> {
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
        // Normalize network errors (e.g., TypeError: Failed to fetch)
        if (!(error instanceof ResponseError)) {
            const normalizedError = new ResponseError(undefined, this.#config.defaultErrorType ?? 'NETWORK_ERROR');

            // We can't return a Response here because it's a network error,
            // but we can throw the normalized error.
            throw normalizedError;
        }

        return undefined;
    }
}
