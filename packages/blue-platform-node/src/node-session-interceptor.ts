/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type RouteHandlerInterceptor, type ModelAndView } from '@blue/dispatcher';
import type { Route } from '@blue/router';
import { type SessionStore } from '@blue/auth-core';
import { getNodeRequest } from './node-request';
import { SESSION_COOKIE } from './session-cookie';

/**
 * Bridges the session cookie into the documented `request.session` seam:
 * reads the `blue-session` cookie, resolves it through a {@link SessionStore}
 * and populates the session bag with `principal` and `token` **before**
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
 * - the interceptor only reads cookies + the store; it never sets cookies
 *   (login/logout own that — see `setSessionCookie`/`clearSessionCookie`);
 * - token values are the opaque ids issued by the store.
 */
export class NodeSessionInterceptor implements RouteHandlerInterceptor {
    readonly #sessionStore: SessionStore;

    constructor(sessionStore: SessionStore) {
        this.#sessionStore = sessionStore;
    }

    async preHandle(route: Route): Promise<boolean> {
        const request = getNodeRequest(route);
        if (!request) return true;
        const token = request.cookies?.[SESSION_COOKIE];
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
