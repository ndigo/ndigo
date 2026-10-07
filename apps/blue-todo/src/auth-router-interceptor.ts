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
 * shared `authClient` state. A rejected navigation is redirected in
 * {@link afterCompletion}: the router's own rollback (`restore`) runs between
 * `preHandle` and `afterCompletion`, so writing `location.hash` from
 * `preHandle` would be clobbered. Setting it afterwards lets the router's
 * `hashchange` listener commit the redirect.
 *
 * @since 0.0.1
 */
export class AuthRouterInterceptor implements RouterInterceptor {
    #redirectPath: string | null = null;

    /**
     * Intercepts route navigation before it proceeds.
     * Checks auth requirements configured in {@link ROUTE_AUTH}.
     */
    async preHandle(route: Route): Promise<boolean> {
        this.#redirectPath = null;
        // `PathRoute.path` drops the leading slash (`auth/profile`); ROUTE_AUTH
        // is keyed with absolute paths. Fold a trailing slash too so
        // `/auth/profile/` matches.
        const absolutePath = route.path.startsWith('/') ? route.path : `/${route.path}`;
        const normalizedPath =
            absolutePath.endsWith('/') && absolutePath.length > 1 ? absolutePath.slice(0, -1) : absolutePath;
        const routeAuth = ROUTE_AUTH[normalizedPath];

        // No auth requirements -> route is public
        if (!routeAuth) {
            return true;
        }

        // Requires authentication but user is not authenticated
        if (routeAuth.requiresAuth && !authClient.isAuthenticated) {
            this.#redirectPath = '/auth/login';
            return false;
        }

        // Requires specific roles — check the principal has all required roles
        if (routeAuth.requiredRoles && routeAuth.requiredRoles.length > 0) {
            const hasRoles = routeAuth.requiredRoles.every((role) => authClient.principal?.hasRole(role) ?? false);
            if (!hasRoles) {
                this.#redirectPath = '/auth/forbidden';
                return false;
            }
        }

        return true;
    }

    async postHandle(_route: Route): Promise<void> {
        // no-op
    }

    /**
     * Performs any redirect requested by a rejected {@link preHandle}.
     * Runs after the router has rolled back the rejected navigation.
     */
    async afterCompletion(_route: Route): Promise<void> {
        const redirectPath = this.#redirectPath;
        this.#redirectPath = null;

        if (redirectPath) {
            window.location.hash = `#${redirectPath}`;
        }
    }
}
