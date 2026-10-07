/**
 * The playground's HTTP authorization guard: enforces `@authenticated` /
 * `@authorized` for routes whose credential can arrive as **either** an opaque
 * session cookie or a `Bearer` access token.
 *
 * Why this exists next to the framework's `AuthRouteGuard`
 * (`@blue/auth-server`): that guard validates against **one** explicit adapter
 * id and extracts the token from **one** place, which is the right fail-closed
 * default — but it cannot serve a route set that accepts both schemes, because
 * the first guard in the chain denies a request that only carries the other
 * scheme's credential. The playground therefore reads the same metadata keys
 * (`@blue/auth-core`'s `AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY`), resolves the
 * principal through `AuthServer.validateAny(token, […explicit scheme order…])`
 * — the documented ordered-fallback seam, never "try every registered adapter" —
 * and denies exactly like the framework guard: `401` unauthenticated, `403`
 * insufficient role. Both are `InterceptorDenial`s, so the platform finalizes
 * them as RFC 9457 problem documents.
 *
 * The resolved principal is written into the documented `request.session` bag
 * (`principal`/`token`) — the same keys `NodeSessionInterceptor` fills for
 * cookie requests — so handlers bind it with `requestSessionValue('principal')`
 * whichever scheme authenticated the request.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { getSymbolMetadata } from '@blue/core';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY, type Principal } from '@blue/auth-core';
import {
    denialOf,
    type InterceptorDenial,
    type ModelAndView,
    type RouteHandlerInterceptor,
    type RouteHandlerMethod,
} from '@blue/dispatcher';
import { HTTPHeaders } from '@blue/http';
import { getNodeRequest, hasDuplicateCookie, type NodeRequest } from '@blue/platform-node';
import type { AuthServer } from '@blue/auth-server';
import type { Route } from '@blue/router';

/** Session-bag key holding the authenticated principal. */
export const REQUEST_PRINCIPAL_KEY = 'principal';

/** Session-bag key holding the credential the principal was resolved from. */
export const REQUEST_TOKEN_KEY = 'token';

/** A handler's declared authentication requirements. */
export interface AuthRequirements {
    /** `@authenticated` (class- or method-level). */
    readonly requiresAuth: boolean;
    /** `@authorized(...)` roles (class- and method-level, stacked). */
    readonly requiredRoles: readonly string[];
}

/**
 * Reads `@authenticated`/`@authorized` metadata off a resolved handler — the
 * same keys and the same class/metadata store `AuthRouteGuard` reads.
 *
 * @param handler - The resolved route handler (a controller instance).
 * @returns The declared requirements; none declared means "public".
 */
export function authRequirements(handler: object | undefined): AuthRequirements {
    const methodHandler = handler as RouteHandlerMethod | undefined;
    // The pipeline hands interceptors a `RouteHandlerMethod` wrapper; the
    // decorator metadata lives on the *controller instance* it wraps (the class
    // and method decorators write into the class's `Symbol.metadata`).
    const metadata = getSymbolMetadata(methodHandler?.handler ?? handler);
    const methodName = typeof methodHandler?.method === 'string' ? methodHandler.method : null;
    const classRequiresAuth = metadata[AUTH_REQUIRED_KEY] === true;
    const methodRequiresAuth = methodName !== null && metadata[`${AUTH_REQUIRED_KEY}:${methodName}`] === true;
    const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
    const methodRoles = methodName === null ? [] : ((metadata[`${AUTH_ROLES_KEY}:${methodName}`] as string[]) ?? []);
    return { requiresAuth: classRequiresAuth || methodRequiresAuth, requiredRoles: [...classRoles, ...methodRoles] };
}

/** Options for {@link AuthMatrixGuard}. */
export interface AuthMatrixGuardOptions {
    /** Adapter ids to validate against, in order. Explicit and fail-closed. */
    readonly adapterIds: readonly string[];
    /** The session cookie name to read (the configured one). */
    readonly cookieName: string;
}

/** Pulls the request credential off a route: session cookie first, then `Bearer`. */
function credentialOf(request: NodeRequest, cookieName: string): string | null {
    // Cookie tossing / planting: more than one cookie under the session name is
    // attacker-controlled ambiguity — treat it as no credential (401), exactly
    // as `NodeSessionInterceptor` fails closed.
    if (hasDuplicateCookie(request.headers?.['cookie'], cookieName)) {
        return null;
    }
    const cookie = request.cookies?.[cookieName];
    if (typeof cookie === 'string' && cookie !== '') {
        return cookie;
    }
    // A repeated `Authorization` line arrives as an array; the first value is
    // the one `bearerToken` scheme-checks (and rejects unless it is `Bearer …`).
    const authorization = request.headers?.['authorization'];
    return (
        HTTPHeaders.AUTHORIZATION.bearerToken(Array.isArray(authorization) ? authorization[0] : authorization) ?? null
    );
}

export class AuthMatrixGuard implements RouteHandlerInterceptor {
    readonly #authServer: AuthServer;
    readonly #adapterIds: string[];
    readonly #cookieName: string;

    /**
     * @param authServer - The server-side auth coordinator (adapter resolution).
     * @param options - The explicit scheme list and the session cookie name.
     */
    constructor(authServer: AuthServer, options: AuthMatrixGuardOptions) {
        this.#authServer = authServer;
        this.#adapterIds = [...options.adapterIds];
        this.#cookieName = options.cookieName;
    }

    /**
     * Enforces the handler's declared requirements before dispatch.
     *
     * @param route - The route being dispatched.
     * @param handler - The resolved handler (controller instance + method name).
     * @returns `true` to proceed, or the denial that finalizes the response.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const { requiresAuth, requiredRoles } = authRequirements(handler);
        if (!requiresAuth && requiredRoles.length === 0) {
            return true;
        }
        const request = getNodeRequest(route);
        if (!request) {
            return true;
        }
        const token = credentialOf(request, this.#cookieName);
        if (token === null) {
            return denialOf(401);
        }
        // Fail closed: an unregistered adapter id is a configuration error, but
        // the request is still denied — never let an error open a guarded route.
        const principal: Principal | null = await this.#authServer
            .validateAny(token, this.#adapterIds)
            .catch(() => null);
        if (principal === null) {
            return denialOf(401);
        }
        if (requiredRoles.length > 0 && !requiredRoles.every((role) => principal.hasRole(role))) {
            return denialOf(403);
        }
        request.session[REQUEST_PRINCIPAL_KEY] = principal;
        request.session[REQUEST_TOKEN_KEY] = token;
        return true;
    }

    /** No response shaping — the handler owns the body. */
    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op
    }

    /** No completion work. */
    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op
    }
}
