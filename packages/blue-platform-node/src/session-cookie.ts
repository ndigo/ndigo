/**
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import type { ServerResponse } from 'node:http';
import type { Route } from '@blue/router';
import { HTTPHeaders } from '@blue/http';
import { NODE_RESPONSE_ATTRIBUTE } from './node-request';

/**
 * The session cookie name for opaque server sessions (AD-33 D-6).
 */
export const SESSION_COOKIE = 'blue-session';

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
}

/**
 * Builds the `Set-Cookie` value for a session token:
 * `blue-session=<token>; HttpOnly; SameSite=Lax; Path=/[; Secure]`.
 */
export function buildSessionCookie(token: string, options: SessionCookieOptions = {}): string {
    const attributes = ['HttpOnly', 'SameSite=Lax', 'Path=/'];
    if (options.secure ?? true) attributes.push('Secure');
    return HTTPHeaders.SET_COOKIE.buildValue(SESSION_COOKIE, token, attributes);
}

/**
 * Builds the `Set-Cookie` value that expires the session cookie
 * immediately (`Max-Age=0` + epoch `Expires`).
 */
export function buildSessionCookieClear(): string {
    return HTTPHeaders.SET_COOKIE.buildValue(SESSION_COOKIE, '', [
        'HttpOnly',
        'SameSite=Lax',
        'Path=/',
        'Max-Age=0',
        'Expires=Thu, 01 Jan 1970 00:00:00 GMT',
    ]);
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
 * headers were sent or without a response.
 */
export function clearSessionCookie(route: Route): void {
    const response = getNodeResponse(route);
    if (response && !response.headersSent) {
        response.setHeader(HTTPHeaders.SET_COOKIE.name, buildSessionCookieClear());
    }
}

function getNodeResponse(route: Route): ServerResponse | undefined {
    return route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
}
