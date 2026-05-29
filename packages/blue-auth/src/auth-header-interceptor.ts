/**
 * @author Jeff Rose
 */

import { type RequestAwareHTTPInterceptor, type HTTP } from '@blue/http';
import { type Session } from './session';

/**
 * An HTTP interceptor that injects an `Authorization: Bearer <token>` header
 * into outgoing requests when the session is authenticated.
 *
 * Wire this interceptor into your {@link HTTP} instance to automatically
 * propagate the session token on every outbound request.
 */
export class AuthHeaderInterceptor implements RequestAwareHTTPInterceptor {
    #session: Session;

    /**
     * @param session - The active session from which the bearer token is read.
     */
    constructor(session: Session) {
        this.#session = session;
    }

    /**
     * Injects the `Authorization` header if the session has a valid token.
     * Returns `void` (no-op) when unauthenticated so the original request
     * passes through unchanged.
     *
     * @param request - The outgoing request.
     * @param http - The HTTP client executing the request.
     * @returns A cloned `Request` with the auth header set, or `void`.
     */
    async preRequest(request: Request, http: HTTP): Promise<Request | void> {
        if (!this.#session.isAuthenticated || !this.#session.token) {
            return;
        }

        const headers = new Headers(request.headers);
        headers.set('Authorization', `Bearer ${this.#session.token}`);
        return new Request(request, { headers });
    }
}
