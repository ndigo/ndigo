/**
 * @module ndigo-platform-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { HTTP, RequestAwareHTTPInterceptor } from '@ndigo/http';

/**
 * Configuration for the {@link FetchCredentialsInterceptor}.
 *
 * This is a CLIENT-side fetch helper: it adjusts `credentials`/`mode` on the
 * outgoing request so the browser performs the cross-origin handshake. It is
 * NOT a server-side CORS boundary — the server must attach the allow headers
 * (see `@ndigo/platform-node` `CORSInterceptor`).
 */
export interface FetchCredentialsInterceptorConfig {
    /**
     * Fetch credentials mode for cross-origin requests: `'include'` sends
     * cookies/authentication on cross-origin requests (requires the server's
     * `Access-Control-Allow-Credentials`), `'omit'` suppresses them.
     * @defaultValue `'omit'` — the interceptor default. Note that the native
     * `fetch` default is `'same-origin'`.
     */
    credentials?: RequestCredentials;
}

/**
 * HTTP interceptor that sets the fetch `credentials` mode for cross-origin
 * (CORS) requests. This is a browser-side helper ONLY — Fetch already
 * enforces CORS; the interceptor just controls whether credentials travel
 * with the request.
 *
 * @example
 * ```ts
 * const http = new HTTP([new FetchCredentialsInterceptor({ credentials: 'include' })]);
 * await http.get('https://api.example.com/data');
 * ```
 */
export class FetchCredentialsInterceptor implements RequestAwareHTTPInterceptor {
    readonly #credentials: RequestCredentials;

    constructor(config: FetchCredentialsInterceptorConfig = {}) {
        this.#credentials = config.credentials ?? 'omit';
    }

    /**
     * Applies the configured credentials mode to the outgoing request.
     *
     * Clones the request so method, headers, body, signal, mode, redirect,
     * cache, integrity and keepalive are preserved, overriding only `credentials`.
     *
     * @param request - The outgoing request.
     * @returns A clone of the request carrying the credentials mode.
     */
    async preRequest(request: Request, _http: HTTP): Promise<Request | void> {
        return new Request(request, { credentials: this.#credentials });
    }
}
