/**
 */
import { HTTPInit, ResponseAwareHTTPInterceptor, rebuildResponse } from '../http';

/**
 * Configuration options for the StatusInterceptor.
 */
export interface StatusInterceptorConfig {
    /**
     * A mapping of HTTP status codes to application-specific status strings.
     * @example
     * ```ts
     * const statusMappings = { 200: 'SUCCESS', 404: 'NOT_FOUND', 500: 'SERVER_ERROR' };
     * ```
     */
    statusMappings?: Record<number, string>;
    /**
     * The default status string to use when no mapping is found.
     * @defaultValue 'UNKNOWN'
     */
    defaultStatus?: string;
}

/**
 * HTTP interceptor that normalizes HTTP status codes into consistent application-level status representations.
 *
 * This interceptor adds a normalized status string to the response, which can be used by the
 * application to handle responses without relying on numeric HTTP codes.
 *

 */
export class StatusInterceptor implements ResponseAwareHTTPInterceptor {
    #config: StatusInterceptorConfig;

    /**
     * Creates a new status interceptor.
     *
     * @param config - Status interceptor configuration.
     */
    constructor(config: StatusInterceptorConfig = {}) {
        this.#config = config;
    }

    /**
     * Normalizes the HTTP status code of the response.
     *
     * @param response - The response to normalize.
     * @param settings - The request settings used for the call.
     * @returns The response.
     */
    async postResponse(response: Response, settings: HTTPInit): Promise<Response | void> {
        const status = response.status;
        const normalizedStatus = this.#config.statusMappings?.[status] ?? this.#config.defaultStatus ?? 'UNKNOWN';

        // We can't modify the Response object directly, so we create a new one
        // with the same properties but adding a custom header for the normalized status.
        const newHeaders = new Headers(response.headers);
        newHeaders.set('X-App-Status', normalizedStatus);

        return rebuildResponse(response, response.body, newHeaders);
    }
}
