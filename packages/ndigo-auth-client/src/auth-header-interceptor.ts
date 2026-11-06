/**
 */
import { HTTP, RequestAwareHTTPInterceptor } from '@ndigo/http';
import { AuthSession } from '@ndigo/auth-core';

/**
 * HTTP interceptor that injects an `Authorization: Bearer <token>` header
 * into outgoing requests when a valid session is available.
 *
 * Integrates with `@ndigo/http`'s request pipeline. Attach it to any `HTTP`
 * client to automatically authenticate API calls.
 *
 * @example
 * ```ts
 * const http = new HTTP([new AuthHeaderInterceptor(session)]);
 *
 * // Subsequent requests include Authorization header automatically
 * await http.get('https://api.example.com/me');
 * ```
 */
export class AuthHeaderInterceptor implements RequestAwareHTTPInterceptor {
    readonly #session: AuthSession;

    /**
     * @param session - The session providing the current auth token.
     */
    constructor(session: AuthSession) {
        this.#session = session;
    }

    /**
     * Injects the `Authorization` header before the request is sent.
     *
     * @param request - The outgoing request.
     * @param _http - The HTTP client executing the request.
     * @returns A cloned request with the header set, or void when no token is available.
     */
    async preRequest(request: Request, _http: HTTP): Promise<Request | void> {
        if (!this.#session.isAuthenticated || !this.#session.token) {
            return;
        }

        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${this.#session.token}`);

        return new Request(request, { headers });
    }
}
