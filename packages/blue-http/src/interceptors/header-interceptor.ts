/**
 * @author Jeff Rose
 */

import { HTTP, RequestAwareHTTPInterceptor } from '../http';
import * as HTTPHeaders from '../http-headers';

/**
 * Configuration options for the HeaderInterceptor.
 */
export interface HeaderInterceptorConfig {
    /**
     * The CSRF token to include in the X-CSRF-Token header.
     */
    csrfToken?: string;
    /**
     * The channel ID to include in the X-Channel-ID header.
     */
    channelId?: string;
    /**
     * Whether to generate a unique request ID for each request.
     * @default false
     */
    generateRequestId?: boolean;
}

/**
 * HTTP interceptor that adds standard headers to outgoing requests.
 *
 * This interceptor implements the RequestAwareHTTPInterceptor interface and
 * adds CSRF tokens, channel IDs, and request IDs to the request headers.
 *
 * @implements {module:http.RequestAwareHTTPInterceptor}
 */
export class HeaderInterceptor implements RequestAwareHTTPInterceptor {
    #config: HeaderInterceptorConfig;

    /**
     * Creates a new header interceptor.
     *
     * @param config - Header interceptor configuration.
     */
    constructor(config: HeaderInterceptorConfig = {}) {
        this.#config = config;
    }

    /**
     * Adds configured headers to the request before it is sent.
     *
     * @param request - The request to modify.
     * @param http - The HTTP client executing the request.
     * @returns A new Request object with the updated headers.
     */
    async preRequest(request: Request, http: HTTP): Promise<Request> {
        const headers = new Headers(request.headers);

        if (this.#config.csrfToken) {
            HTTPHeaders.X_CSRF_TOKEN.set(headers, this.#config.csrfToken);
        }

        if (this.#config.channelId) {
            HTTPHeaders.X_CHANNEL_ID.set(headers, this.#config.channelId);
        }

        if (this.#config.generateRequestId) {
            HTTPHeaders.X_REQUEST_ID.set(headers, crypto.randomUUID());
        }

        return new Request(request, {
            headers,
        });
    }
}
