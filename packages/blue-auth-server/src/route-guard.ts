/**
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
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@blue/auth-core';
import { type AuthServer } from './server';

/** Denial behavior overrides for {@link AuthRouteGuard}. */
export interface AuthGuardDenialOptions {
    /** Status for missing/invalid credentials (default `401`). */
    unauthenticatedStatus?: number;
    /** Status for insufficient roles (default `403`). */
    forbiddenStatus?: number;
}

/**
 * A {@link RouteHandlerInterceptor} that enforces authentication and authorization
 * requirements declared via the `@authenticated` and `@authorized` decorators.
 *
 * This guard integrates with {@link AuthServer} to verify the principal's identity
 * and roles before allowing the request to proceed to the handler.
 *
 * Validation targets one explicitly selected authentication adapter (scheme);
 * the guard never tries every registered adapter, which could accept tokens
 * issued for an unrelated scheme.
 *
 * Denials fail closed with an explicit {@link InterceptorDenial}: `401` for
 * missing/invalid credentials, `403` for insufficient roles. The platform
 * adapter finalizes the response, so denied requests never stay open.
 */
export class AuthRouteGuard implements RouteHandlerInterceptor {
    #authServer: AuthServer;
    #adapterId: string;
    #tokenExtractor: (route: Route) => string | null;
    #denialOptions: AuthGuardDenialOptions;

    /**
     * @param authServer - The server-side auth coordinator.
     * @param tokenExtractor - A function to extract the auth token from the route/request.
     * @param adapterId - The ID of the authentication adapter to validate with.
     * @param denialOptions - Denial status overrides.
     */
    constructor(
        authServer: AuthServer,
        tokenExtractor: (route: Route) => string | null,
        adapterId: string,
        denialOptions: AuthGuardDenialOptions = {},
    ) {
        this.#authServer = authServer;
        this.#adapterId = adapterId;
        this.#tokenExtractor = tokenExtractor;
        this.#denialOptions = denialOptions;
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
        // constructor[Symbol.metadata] is a runtime TC39 decorator property
        // that TS 5.7's Function type doesn't declare. The property exists on
        const metadata: Record<string, unknown> = (
            ((methodHandler?.handler?.constructor as unknown as { [key: symbol]: unknown } | undefined)?.[Symbol.metadata] ??
                {}) as Record<string, unknown>
        );
        const methodName: string | null =
            typeof methodHandler?.method === 'string' ? methodHandler.method : null;

        const classRequiresAuth = Boolean(metadata[AUTH_REQUIRED_KEY]);
        const methodRequiresAuth = methodName
            ? Boolean(metadata[`${AUTH_REQUIRED_KEY}:${methodName}`])
            : false;
        const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
        const methodRoles = methodName
            ? ((metadata[`${AUTH_ROLES_KEY}:${methodName}`] as string[] | undefined) ?? [])
            : [];

        const requiresAuth = classRequiresAuth || methodRequiresAuth;
        const requiredRoles = [...classRoles, ...methodRoles];

        if (!requiresAuth && requiredRoles.length === 0) {
            return true;
        }

        const token = this.#tokenExtractor(route);
        if (!token) {
            return this.#deny(this.#denialOptions.unauthenticatedStatus ?? 401);
        }

        // Fail closed: an unregistered adapter is a configuration error, but
        // the request is still denied with 401 rather than thrown open.
        const principal = await this.#authServer.validate(this.#adapterId, token).catch(() => null);
        if (!principal) {
            return this.#deny(this.#denialOptions.unauthenticatedStatus ?? 401);
        }

        if (requiredRoles.length > 0 && !requiredRoles.every((role) => principal.hasRole(role))) {
            return this.#deny(this.#denialOptions.forbiddenStatus ?? 403);
        }

        return true;
    }

    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op
    }

    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op
    }
}
