/**
 * @author Jeff Rose
 */

import { RouterInterceptor, type RouterMiddleware } from '@blue/router';
import { Route } from '@blue/router';
import { ClientAuthGuard } from '@blue/auth-client';
import { authClient } from './auth-store';

/**
 * Route-to-authentication-requirements map for the demo application.
 *
 * Each entry maps a route path (as seen in the router) to its auth requirements.
 * Routes not listed here are publicly accessible.
 */
const ROUTE_AUTH: Record<string, { requiresAuth: boolean; requiredRoles?: string[] }> = {
    '/auth/profile': { requiresAuth: true },
    '/auth/admin': { requiresAuth: true, requiredRoles: ['admin'] },
};

/**
 * Adapts the `ClientAuthGuard` to work as a `RouterInterceptor`.
 *
 * This adapter intercepts route changes and checks authentication/authorization
 * requirements before allowing navigation. If access is denied, it redirects
 * to the configured login or forbidden page.
 *
 * @since 0.0.1
 */
export class AuthRouterInterceptor implements RouterInterceptor {
    #guard: ClientAuthGuard;

    constructor(guard: ClientAuthGuard) {
        this.#guard = guard;
    }

    /**
     * Intercepts route navigation before it proceeds.
     * Checks auth requirements configured in {@link ROUTE_AUTH}.
     */
    async preHandle(route: Route): Promise<boolean> {
        const routeAuth = ROUTE_AUTH[route.path];

        // No auth requirements -> route is public
        if (!routeAuth) {
            return true;
        }

        // Requires authentication but user is not authenticated
        if (routeAuth.requiresAuth && !authClient.isAuthenticated) {
            window.location.hash = '#/auth/login';
            return false;
        }

        // Requires specific roles — check the principal has all required roles
        if (routeAuth.requiredRoles && routeAuth.requiredRoles.length > 0) {
            const hasRoles = routeAuth.requiredRoles.every(
                (role) => authClient.principal?.hasRole(role) ?? false,
            );
            if (!hasRoles) {
                window.location.hash = '#/auth/forbidden';
                return false;
            }
        }

        return true;
    }

    async postHandle(_route: Route): Promise<void> {
        // no-op
    }

    async afterCompletion(_route: Route): Promise<void> {
        // no-op
    }
}

/**
 * Creates a simple auth middleware function for the router.
 *
 * This is a lighter-weight alternative to `AuthRouterInterceptor` that
 * only checks authentication status without role-based access control.
 *
 * @param requireAuth - Whether authentication is required for this route.
 * @param loginRedirect - The hash route to redirect to if unauthenticated.
 */
export function authMiddleware(
    requireAuth: boolean,
    loginRedirect: string = '#/login',
): RouterMiddleware {
    return (route: Route): boolean => {
        if (!requireAuth) {
            return true;
        }

        if (!authClient.isAuthenticated) {
            window.location.hash = loginRedirect;
            return false;
        }

        return true;
    };
}