/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ServerResponse } from 'node:http';
import type { Route } from '@ndigo/router';
import { HTTPHeaders } from '@ndigo/http';
import { IllegalStateError } from '@ndigo/core';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * The session cookie name for opaque server sessions (AD-33 D-6).
 *
 * Carries the `__Host-` security prefix (SEC-AUD2-SEC-2 / PLN-F6): browsers
 * accept such a cookie only when it is `Secure`, `Path=/` and `Domain`-less,
 * which pins it to the exact origin and defeats cookie tossing / planting from
 * a sibling subdomain or a non-`Secure` look-alike. Both constraints are
 * satisfied by {@link buildSessionCookie}; a name that must trade them away
 * (e.g. the localhost demo over plain HTTP) can opt out through
 * {@link SessionCookieOptions.name}.
 */
export const SESSION_COOKIE = '__Host-ndigo-session';

/**
 * Options for the session cookie.
 */
export interface SessionCookieOptions {
    /**
     * Add the `Secure` attribute. Default `true` — same posture as the
     * CSRF cookie: over plain HTTP the cookie would be transmitted in
     * clear. Set `false` for localhost dev only.
     */
    secure?: boolean;
    /**
     * Cookie name escape hatch for deployments (migrations, dev over plain
     * HTTP). Defaults to {@link SESSION_COOKIE}. A `__Host-`-prefixed name
     * with `secure: false` is invalid by construction and fails loudly —
     * choose an unprefixed name (and set it consistently when reading).
     */
    name?: string;
}

/**
 * Fails loudly on a cookie configuration the browser would reject: the
 * `__Host-` prefix mandates `Secure` (alongside `Path=/` and no `Domain`,
 * both always true here). Emitting the cookie anyway would silently drop it.
 */
function assertValidCookie(name: string, secure: boolean): void {
    if (name.startsWith('__Host-') && !secure) {
        throw new IllegalStateError(
            `Cookie "${name}" carries the __Host- prefix, which requires the Secure attribute. ` +
                'Enable Secure, or set `name` to an unprefixed cookie name for plain-HTTP deployments.'
        );
    }
}

/**
 * Builds the `Set-Cookie` value for a session token:
 * `__Host-ndigo-session=<token>; HttpOnly; SameSite=Lax; Path=/[; Secure]`.
 * The name is configurable via `options.name`.
 *
 * @throws {IllegalStateError} When a `__Host-`-prefixed `name` is combined
 * with `secure: false` (the browser would reject the cookie).
 */
export function buildSessionCookie(token: string, options: SessionCookieOptions = {}): string {
    const name = options.name ?? SESSION_COOKIE;
    const secure = options.secure ?? true;
    assertValidCookie(name, secure);
    const attributes = ['HttpOnly', 'SameSite=Lax', 'Path=/'];
    if (secure) attributes.push('Secure');
    return HTTPHeaders.SET_COOKIE.buildValue(name, token, attributes);
}

/**
 * Builds the `Set-Cookie` value that expires the session cookie
 * immediately (`Max-Age=0` + epoch `Expires`) under the same name and
 * `Secure`/`Path` attributes it was set with (no `Domain`).
 *
 * @throws {IllegalStateError} When a `__Host-`-prefixed `name` is combined
 * with `secure: false` (the browser would reject the clear).
 */
export function buildSessionCookieClear(options: SessionCookieOptions = {}): string {
    const name = options.name ?? SESSION_COOKIE;
    const secure = options.secure ?? true;
    assertValidCookie(name, secure);
    const attributes = ['HttpOnly', 'SameSite=Lax', 'Path=/'];
    if (secure) attributes.push('Secure');
    attributes.push('Max-Age=0', 'Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    return HTTPHeaders.SET_COOKIE.buildValue(name, '', attributes);
}

/**
 * Sets the session cookie on the request's node response. No-op after
 * headers were sent or without a response.
 */
export function setSessionCookie(route: Route, token: string, options?: SessionCookieOptions): void {
    const response = getNodeResponse(route);
    if (response && !response.headersSent) {
        response.setHeader(HTTPHeaders.SET_COOKIE.name, buildSessionCookie(token, options));
    }
}

/**
 * Clears the session cookie on the request's node response. No-op after
 * headers were sent or without a response. Pass the same `name`/`secure`
 * options used to set the cookie so the clear targets it exactly.
 */
export function clearSessionCookie(route: Route, options?: SessionCookieOptions): void {
    const response = getNodeResponse(route);
    if (response && !response.headersSent) {
        response.setHeader(HTTPHeaders.SET_COOKIE.name, buildSessionCookieClear(options));
    }
}

function getNodeResponse(route: Route): ServerResponse | undefined {
    return route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
}
