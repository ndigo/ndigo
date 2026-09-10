/**
 * CSRF protection for Node applications (Double-Submit Cookie pattern).
 *
 * Issues a session cookie carrying a random CSRF token, and requires mutating
 * requests (POST/PUT/DELETE/PATCH/QUERY) to echo that token back via the
 * `X-CSRF-Token` header (or a `csrf_token` form/body field). This is the
 * standard double-submit defense: a cross-site attacker cannot read the cookie,
 * so the echoed token cannot match.
 *
 * Safe methods (GET/HEAD/OPTIONS/TRACE/CONNECT) pass through.
 *
 * @module
 * @since 1.0.0
 */

import { randomBytes } from 'node:crypto';
import { Route } from '@blue/router';
import { RouteHandlerInterceptor } from '@blue/dispatcher';
import { HTTPHeaders } from '@blue/http';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE, NodeRequest } from './node-request';
import { ProblemTypes, writeProblem } from './problem-details';
import type { ServerResponse } from 'node:http';

/** The cookie name holding the CSRF token. */
export const CSRF_COOKIE = 'blue-csrf';

/** Mutating HTTP methods that require CSRF validation. */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH', 'QUERY']);

/** Header used to echo the token back (a constant from the @blue/http vocabulary). */
const CSRF_HEADER = String(HTTPHeaders.X_CSRF_TOKEN);

/**
 * Options for the CSRF interceptor.
 */
export interface CsrfInterceptorOptions {
    /** Cookie name; defaults to `'blue-csrf'`. */
    cookieName?: string;
    /** Body/form field accepted as an alternative to the header. */
    fieldName?: string;
    /** Header name; defaults to `X-CSRF-Token`. */
    headerName?: string;
    /** Cookie attributes appended to the Set-Cookie value. Defaults to `'SameSite=Lax; Secure; Path=/'`. */
    cookieOptions?: string;
    /** Token length in bytes (default 32; must be an integer in 16–1024). */
    tokenBytes?: number;
}

/**
 * A {@link RouteHandlerInterceptor} enforcing double-submit-cookie CSRF.
 *
 * Register on a handler mapping alongside the logging interceptor:
 *
 * ```ts
 * const mapping = new RadixMetadataHandlerMapping();
 * mapping.interceptors.push(new CsrfInterceptor());
 * ```
 */
export class CsrfInterceptor implements RouteHandlerInterceptor {
    #cookieName: string;
    #fieldName: string;
    #headerName: string;
    #cookieOptions: string;
    #tokenBytes: number;

    /**
     * @param options - Interceptor options.
     */
    constructor(options: CsrfInterceptorOptions = {}) {
        this.#cookieName = options.cookieName ?? CSRF_COOKIE;
        this.#fieldName = options.fieldName ?? 'csrf_token';
        this.#headerName = options.headerName ?? CSRF_HEADER;
        // `Secure` by default: on HTTPS deployments served alongside an HTTP
        // listener, a cookie without it would be transmitted in clear.
        this.#cookieOptions = options.cookieOptions ?? 'SameSite=Lax; Secure; Path=/';
        this.#tokenBytes = options.tokenBytes ?? 32;
        if (!Number.isInteger(this.#tokenBytes) || this.#tokenBytes < 16 || this.#tokenBytes > 1024) {
            throw new RangeError(
                `CsrfInterceptor tokenBytes must be an integer between 16 and 1024, received ${String(this.#tokenBytes)}`
            );
        }
    }

    postHandle(): void {
        // No post-processing — CSRF is a pre-handler concern.
    }

    completeHandle(): void {
        // No completion hook needed.
    }

    /**
     * Validates the request's CSRF token for mutating methods, issuing the
     * cookie on first (safe) visit.
     *
     * @param route - The current route.
     * @returns `false` (with a 403 written) when the token is missing/mismatched.
     */
    preHandle(route: Route): boolean {
        const request = getNodeRequest(route);

        // The token lives in the session cookie. If absent, mint one and issue it.
        const cookie = request?.cookies?.[this.#cookieName];
        const token = cookie || this.#issueToken(route, request);

        const method = route.method;
        if (!method || !MUTATING_METHODS.has(method)) {
            return true;
        }

        const submitted =
            request?.headers?.[this.#headerName.toLowerCase()] ??
            (typeof request?.body === 'object' && request.body !== null
                ? (request.body[this.#fieldName] as string | undefined)
                : undefined);

        if (typeof submitted === 'string' && submitted.length > 0 && submitted === token) {
            return true;
        }

        this.#reject(route, 'Invalid CSRF token');
        return false;
    }

    /**
     * Issues a fresh CSRF cookie (via `Set-Cookie`) and returns the token.
     */
    #issueToken(route: Route, request: NodeRequest | undefined): string {
        const token = randomBytes(this.#tokenBytes).toString('base64url');
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.headersSent) {
            res.setHeader('Set-Cookie', `${this.#cookieName}=${token}; ${this.#cookieOptions}`);
        }
        return token;
    }

    /**
     * Writes a 403 problem document for a rejected request.
     */
    #reject(route: Route, reason: string): void {
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.headersSent) {
            writeProblem(res, {
                type: ProblemTypes.forbidden,
                title: 'Forbidden',
                status: 403,
                detail: reason,
            });
        }
    }
}
