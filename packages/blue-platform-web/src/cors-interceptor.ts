/**
 * @author Jeff Rose
 */

import { HTTP, RequestAwareHTTPInterceptor } from '@blue/http';

/**
 * Configuration options for the CORSInterceptor.
 */
export interface CORSInterceptorConfig {
    /**
     * Allowed origins. Defaults to `['*']`.
     */
    allowedOrigins?: string[];
    /**
     * Allowed HTTP methods. Defaults to `['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS']`.
     */
    allowedMethods?: string[];
    /**
     * Allowed headers. Defaults to `['Content-Type', 'Authorization', 'X-Requested-With']`.
     */
    allowedHeaders?: string[];
    /**
     * Whether to include credentials. Defaults to `false`.
     */
    withCredentials?: boolean;
}

const DEFAULT_ORIGINS = ['*'];
const DEFAULT_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'];
const DEFAULT_HEADERS = ['Content-Type', 'Authorization', 'X-Requested-With'];

/**
 * HTTP interceptor that handles CORS preflight requests automatically.
 *
 * In browsers, CORS is enforced by the browser itself. This interceptor
 * is primarily useful for client-side code that wants to ensure the
 * correct request mode is set, and for server-side usage (Node.js) where
 * CORS headers need to be attached to responses.
 *
 * @example
 * ```ts
 * const http = new HTTP([new CORSInterceptor({ withCredentials: true })]);
 * await http.get('https://api.example.com/data');
 * ```
 */
export class CORSInterceptor implements RequestAwareHTTPInterceptor {
    readonly #config: CORSInterceptorConfig;

    constructor(config: CORSInterceptorConfig = {}) {
        this.#config = config;
    }

    /**
     * Applies CORS settings to the outgoing request.
     *
     * @param request - The outgoing request.
     * @param _http - The HTTP client.
     * @returns The modified request with CORS settings applied.
     */
    async preRequest(request: Request, _http: HTTP): Promise<Request | void> {
        const { allowedOrigins, allowedMethods, allowedHeaders, withCredentials } = this.#config;

        // Clone the request to modify its mode and headers
        const init: RequestInit & { mode?: RequestMode } = {
            method: request.method,
            headers: new Headers(request.headers),
            body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
        };

        // Set request mode for CORS
        if (withCredentials) {
            init.credentials = 'include';
        } else {
            init.mode = 'cors';
        }

        // Add Origin header when specific origins are configured
        if (allowedOrigins && !allowedOrigins.includes('*') && allowedOrigins.length > 0) {
            init.headers = new Headers(init.headers);
            init.headers.set('Origin', allowedOrigins[0]);
        }

        // Add Access-Control-Request-* headers for preflight
        if (request.method === 'OPTIONS') {
            init.headers = new Headers(init.headers);
            if (allowedMethods) {
                init.headers.set('Access-Control-Request-Method', allowedMethods.join(', '));
            }
            if (allowedHeaders) {
                init.headers.set('Access-Control-Request-Headers', allowedHeaders.join(', '));
            }
        }

        return new Request(request.url, init);
    }
}