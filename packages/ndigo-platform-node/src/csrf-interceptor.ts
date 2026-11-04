/**
 * CSRF protection for Node applications (Double-Submit Cookie pattern).
 *
 * The default cookie name is `__Host-`-prefixed (`__Host-ndigo-csrf`):
 * browsers only accept a `__Host-` cookie when it is `Secure`, `Path=/`,
 * and carries no `Domain` attribute — the interceptor's defaults satisfy
 * all three. The prefix pins the cookie to the exact host, so a sibling
 * subdomain (or any origin able to set cookies for a parent domain) cannot
 * toss a forged token into the double-submit comparison. Overriding
 * `cookieName` with a non-prefixed name gives the pinning up — only do so
 * when every sibling subdomain is trusted. Dropping `Secure`/`Path=/` (or
 * adding a `Domain`) while keeping the prefix makes browsers reject the
 * cookie outright, so mutating requests fail closed.
 *
 * @module ndigo-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
import { timingSafeEqual } from 'node:crypto';
import { randomToken } from '@ndigo/util';
import { Route } from '@ndigo/router';
import { RouteHandlerInterceptor } from '@ndigo/dispatcher';
import { HTTPHeaders } from '@ndigo/http';
import { getNodeRequest, NODE_RESPONSE_ATTRIBUTE, NodeRequest } from './node-request';
import { ProblemTypes, writeProblem } from './problem-details';
import type { ServerResponse } from 'node:http';

/**
 * The cookie name holding the CSRF token.
 *
 * `__Host-`-prefixed (Secure + `Path=/` + no `Domain` are required by
 * browsers for the prefix; the defaults here provide them) so a sibling
 * subdomain cannot overwrite the cookie — see the module docs.
 */
export const CSRF_COOKIE = '__Host-ndigo-csrf';

/** Mutating HTTP methods that require CSRF validation. */
const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH', 'QUERY']);

/** Header used to echo the token back (a constant from the @ndigo/http vocabulary). */
const CSRF_HEADER = String(HTTPHeaders.X_CSRF_TOKEN);

/**
 * Options for the CSRF interceptor.
 */
export interface CSRFInterceptorOptions {
    /**
     * Cookie name; defaults to `'__Host-ndigo-csrf'`. A name without the
     * `__Host-` prefix gives up the sibling-subdomain cookie-tossing
     * protection — see the module docs.
     */
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
 * mapping.interceptors.push(new CSRFInterceptor());
 * ```
 */
export class CSRFInterceptor implements RouteHandlerInterceptor {
    #cookieName: string;
    #fieldName: string;
    #headerName: string;
    #cookieOptions: string;
    #tokenBytes: number;

    /**
     * @param options - Interceptor options.
     */
    constructor(options: CSRFInterceptorOptions = {}) {
        this.#cookieName = options.cookieName ?? CSRF_COOKIE;
        this.#fieldName = options.fieldName ?? 'csrf_token';
        this.#headerName = options.headerName ?? CSRF_HEADER;
        // `Secure` by default: on HTTPS deployments served alongside an HTTP
        // listener, a cookie without it would be transmitted in clear.
        this.#cookieOptions = options.cookieOptions ?? 'SameSite=Lax; Secure; Path=/';
        this.#tokenBytes = options.tokenBytes ?? 32;
        if (!Number.isInteger(this.#tokenBytes) || this.#tokenBytes < 16 || this.#tokenBytes > 1024) {
            throw new RangeError(
                `CSRFInterceptor tokenBytes must be an integer between 16 and 1024, received ${String(this.#tokenBytes)}`
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

        // SEC-9: constant-time compare of the bearer secret. A length guard
        // runs first so a length-mismatched token is rejected (no throw) —
        // `timingSafeEqual` itself throws on unequal buffer lengths.
        if (
            typeof submitted === 'string' &&
            submitted.length > 0 &&
            submitted.length === token.length &&
            timingSafeEqual(Buffer.from(submitted), Buffer.from(token))
        ) {
            return true;
        }

        this.#reject(route, 'Invalid CSRF token');
        return false;
    }

    /**
     * Issues a fresh CSRF cookie (via `Set-Cookie`) and returns the token.
     */
    #issueToken(route: Route, request: NodeRequest | undefined): string {
        const token = randomToken(this.#tokenBytes);
        const res = route.attributes?.[NODE_RESPONSE_ATTRIBUTE] as ServerResponse | undefined;
        if (res && !res.headersSent) {
            res.setHeader(
                HTTPHeaders.SET_COOKIE.name,
                HTTPHeaders.SET_COOKIE.buildValue(this.#cookieName, token, [this.#cookieOptions])
            );
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
