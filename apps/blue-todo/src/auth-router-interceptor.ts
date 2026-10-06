/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { RouterInterceptor, Route } from '@blue/router';
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
 * Adapts authentication checks to the router interceptor contract.
 *
 * The demo applies its route requirements from {@link ROUTE_AUTH} using
 * shared `authClient` state.
 *
 * @since 0.0.1
 */
export class AuthRouterInterceptor implements RouterInterceptor {
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
            const hasRoles = routeAuth.requiredRoles.every((role) => authClient.principal?.hasRole(role) ?? false);
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
