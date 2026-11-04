/**
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type RouteHandlerInterceptor, type ModelAndView } from '@ndigo/dispatcher';
import type { Route } from '@ndigo/router';
import { type SessionStore } from '@ndigo/auth-core';
import { getNodeRequest } from './node-request';
import { hasDuplicateCookie } from './cookie-parser';
import { SESSION_COOKIE } from './session-cookie';

/**
 * Bridges the session cookie into the documented `request.session` seam:
 * reads the `__Host-ndigo-session` cookie, resolves it through a
 * {@link SessionStore} and populates the session bag with `principal` and `token` **before**
 * dispatch — so `requestSessionValue('principal')` / `@session` bindings
 * work for cookie-authenticated requests.
 *
 * Add to your handler mapping alongside `AuthRouteGuard` (which enforces
 * `@authenticated`/`@authorized` and fails closed with 401/403):
 *
 * ```ts
 * mapping.interceptors.push(new NodeSessionInterceptor(sessionStore));
 * mapping.interceptors.push(new AuthRouteGuard(authServer, cookieTokenExtractor, 'credentials'));
 * ```
 *
 * Security contract:
 * - an absent, unknown or expired session leaves the bag **empty**
 *   (anonymous) — the guard then denies; nothing is ever fabricated;
 * - a request presenting the session cookie name more than once is treated
 *   as unauthenticated (cookie tossing / planting fails closed);
 * - the interceptor only reads cookies + the store; it never sets cookies
 *   (login/logout own that — see `setSessionCookie`/`clearSessionCookie`);
 * - token values are the opaque ids issued by the store.
 */
export class NodeSessionInterceptor implements RouteHandlerInterceptor {
    readonly #sessionStore: SessionStore;
    readonly #cookieName: string;

    /**
     * @param sessionStore - Resolves opaque session ids to records.
     * @param cookieName - The session cookie name to read (default
     *   {@link SESSION_COOKIE}); pass the same name given to
     *   `setSessionCookie` when a deployment overrides it.
     */
    constructor(sessionStore: SessionStore, cookieName: string = SESSION_COOKIE) {
        this.#sessionStore = sessionStore;
        this.#cookieName = cookieName;
    }

    async preHandle(route: Route): Promise<boolean> {
        const request = getNodeRequest(route);
        if (!request) return true;
        // Cookie tossing / planting: more than one cookie with the session
        // name is attacker-controlled ambiguity — fail closed (anonymous)
        // instead of trusting the first or last occurrence.
        if (hasDuplicateCookie(request.headers?.['cookie'], this.#cookieName)) return true;
        const token = request.cookies?.[this.#cookieName];
        if (!token) return true;

        const record = await this.#sessionStore.get(token);
        if (!record) return true;

        request.session['principal'] = record.principal;
        request.session['token'] = token;
        return true;
    }

    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op — session restoration happens before dispatch.
    }

    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op.
    }
}
