/**
 * @author Jeff Rose
 */

import { type RouteHandlerInterceptor, type ModelAndView, RouteHandlerMethod } from '@blue/dispatcher';
import { type Route } from '@blue/router';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@blue/auth-core';
import { type AuthServer } from './server';

/**
 * A {@link RouteHandlerInterceptor} that enforces authentication and authorization
 * requirements declared via the `@authenticated` and `@authorized` decorators.
 *
 * This guard integrates with {@link AuthServer} to verify the principal's identity
 * and roles before allowing the request to proceed to the handler.
 */
export class AuthRouteGuard implements RouteHandlerInterceptor {
    #authServer: AuthServer;
    #tokenExtractor: (route: Route) => string | null;

    /**
     * @param authServer - The server-side auth coordinator.
     * @param tokenExtractor - A function to extract the auth token from the route/request.
     */
    constructor(authServer: AuthServer, tokenExtractor: (route: Route) => string | null) {
        this.#authServer = authServer;
        this.#tokenExtractor = tokenExtractor;
    }

    /**
     * Checks authentication and authorization metadata on the handler before
     * allowing execution to proceed.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<boolean> {
        const methodHandler = handler as RouteHandlerMethod | undefined;
                // constructor[Symbol.metadata] is a runtime TC39 decorator property
        // that TS 5.7's Function type doesn't declare. The property exists on
        // every decorated class's constructor at runtime.
        const metadata: Record<string, unknown> = (
            ((methodHandler?.handler?.constructor as any)?.[Symbol.metadata] ?? {}) as Record<string, unknown>
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
            return false;
        }

        const principal = await this.#authServer.validateAny(token);
        if (!principal) {
            return false;
        }

        if (requiredRoles.length > 0) {
            return requiredRoles.every((role) => principal.hasRole(role));
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
