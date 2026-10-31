/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import {
    type RouteHandlerInterceptor,
    type ModelAndView,
    RouteHandlerMethod,
    type InterceptorDenial,
    denialOf,
} from '@blue/dispatcher';
import { type Route } from '@blue/router';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY, type Principal } from '@blue/auth-core';
import { type AuthServer } from './server';

/**
 * One authentication scheme: an explicit adapter id plus a function that pulls
 * that scheme's raw credential off the route. The guard tries the schemes in
 * declaration order and validates the first non-empty credential it finds — so
 * a single route can accept, say, a session cookie AND a `Bearer` token without
 * either being validated against the wrong adapter.
 */
export interface AuthScheme {
    /** The explicit adapter id this scheme's credential is validated against. */
    readonly adapterId: string;
    /** Extracts this scheme's raw credential from the route, or `null`/'' when absent. */
    readonly extract: (route: Route) => string | null;
}

/** Options for {@link AuthMatrixGuard}. */
export interface AuthMatrixGuardOptions {
    /** The schemes to try, in fallback order — explicit adapter ids only. */
    readonly schemes: readonly AuthScheme[];
    /**
     * Called with the resolved principal and the winning token so the caller can
     * stash it (e.g. into `request.session`) for handlers to bind. Omit for a
     * pure allow/deny guard.
     */
    readonly onAuthenticated?: (route: Route, principal: Principal, token: string) => void;
}

/**
 * A {@link RouteHandlerInterceptor} that enforces `@authenticated` /
 * `@authorized` over **multiple** schemes — the multi-scheme counterpart to
 * {@link AuthRouteGuard}, which validates a single explicit adapter id from a
 * single place.
 *
 * It reads the same metadata keys as {@link AuthRouteGuard} (`@blue/auth-core`'s
 * `AUTH_REQUIRED_KEY`/`AUTH_ROLES_KEY`), resolves the principal through
 * `AuthServer.validateAny(token, […explicit scheme order…])` — the documented
 * ordered-fallback seam, never "try every registered adapter" — and denies
 * exactly like the framework guard: `401` unauthenticated, `403` insufficient
 * role. Both are {@link InterceptorDenial}s, so the platform finalizes them as
 * RFC 9457 problem documents.
 *
 * The credential extraction is injected per scheme (transport-agnostic), so this
 * guard carries no platform dependency — the caller supplies how each scheme's
 * credential is read and, optionally, where the resolved principal is stored.
 */
export class AuthMatrixGuard implements RouteHandlerInterceptor {
    #authServer: AuthServer;
    #schemes: readonly AuthScheme[];
    #onAuthenticated?: (route: Route, principal: Principal, token: string) => void;

    /**
     * @param authServer - The server-side auth coordinator (adapter resolution).
     * @param options - The explicit scheme list and optional principal sink.
     */
    constructor(authServer: AuthServer, options: AuthMatrixGuardOptions) {
        this.#authServer = authServer;
        this.#schemes = [...options.schemes];
        this.#onAuthenticated = options.onAuthenticated;
    }

    #deny(statusCode: number): InterceptorDenial {
        return denialOf(statusCode, {
            body: { error: statusCode === 401 ? 'Unauthorized' : 'Forbidden' },
        });
    }

    /**
     * Checks authentication and authorization metadata on the handler before
     * allowing execution to proceed.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<boolean | InterceptorDenial> {
        const methodHandler = handler as RouteHandlerMethod | undefined;
        // constructor[Symbol.metadata] is a runtime TC39 decorator property that
        // TS 5.7's Function type doesn't declare. The property exists on the value.
        const metadata: Record<string, unknown> = ((
            methodHandler?.handler?.constructor as unknown as { [key: symbol]: unknown } | undefined
        )?.[Symbol.metadata] ?? {}) as Record<string, unknown>;
        const methodName: string | null = typeof methodHandler?.method === 'string' ? methodHandler.method : null;

        const classRequiresAuth = Boolean(metadata[AUTH_REQUIRED_KEY]);
        const methodRequiresAuth = methodName ? Boolean(metadata[`${AUTH_REQUIRED_KEY}:${methodName}`]) : false;
        const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
        const methodRoles = methodName
            ? ((metadata[`${AUTH_ROLES_KEY}:${methodName}`] as string[] | undefined) ?? [])
            : [];

        const requiresAuth = classRequiresAuth || methodRequiresAuth;
        const requiredRoles = [...classRoles, ...methodRoles];

        if (!requiresAuth && requiredRoles.length === 0) {
            return true;
        }

        // First non-empty credential wins, in declared scheme order.
        let token: string | null = null;
        for (const scheme of this.#schemes) {
            const candidate = scheme.extract(route);
            if (candidate !== null && candidate !== '') {
                token = candidate;
                break;
            }
        }
        if (token === null) {
            return this.#deny(401);
        }

        // Fail closed: an unregistered adapter id is a configuration error, but the
        // request is still denied — never let an error open a guarded route.
        const principal: Principal | null = await this.#authServer
            .validateAny(
                token,
                this.#schemes.map((scheme) => scheme.adapterId)
            )
            .catch(() => null);
        if (principal === null) {
            return this.#deny(401);
        }

        if (requiredRoles.length > 0 && !requiredRoles.every((role) => principal.hasRole(role))) {
            return this.#deny(403);
        }

        this.#onAuthenticated?.(route, principal, token);
        return true;
    }

    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op
    }

    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op
    }
}
