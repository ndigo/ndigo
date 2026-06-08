/**
 * @author Jeff Rose
 */

import { type RouteHandlerInterceptor, type ModelAndView, RouteHandlerMethod } from '@blue/dispatcher';
import { type Route } from '@blue/router';
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from './_constants';
import { type Session } from './session';

/**
 * A {@link RouteHandlerInterceptor} that enforces authentication and authorization
 * requirements declared via the `@authenticated` and `@authorized` decorators.
 *
 * Register this guard with your handler mapping to block unauthenticated or
 * insufficiently-privileged requests before the handler method is invoked.
 */
export class AuthRouteGuard implements RouteHandlerInterceptor {
    #session: Session;

    /**
     * @param session - The active session used to check authentication state.
     */
    constructor(session: Session) {
        this.#session = session;
    }

    /**
     * Checks authentication and authorization metadata on the handler before
     * allowing execution to proceed.
     *
     * @param route - The current route.
     * @param handler - The resolved handler (expected to be a `RouteHandlerMethod`).
     * @returns `true` to allow execution; `false` to block it.
     */
    async preHandle(route: Route, handler: object | undefined): Promise<boolean> {
        const methodHandler = handler as RouteHandlerMethod | undefined;
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

        if (!this.#session.isAuthenticated) {
            return false;
        }

        if (requiredRoles.length > 0) {
            return requiredRoles.every((role) => this.#session.principal?.hasRole(role) ?? false);
        }

        return true;
    }

    /**
     * No-op post-handle hook.
     */
    async postHandle(_route: Route, _handler: object | undefined, _modelAndView: ModelAndView): Promise<void> {
        // no-op
    }

    /**
     * No-op complete-handle hook.
     */
    async completeHandle(_route: Route, _handler: object | undefined, _error: Error | null): Promise<void> {
        // no-op
    }
}
