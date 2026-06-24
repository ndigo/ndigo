/**
 * @author Jeff Rose
 */

import { RouterInterceptor, RouterMiddleware } from '@blue/router';
import { Route } from '@blue/router';
import { ClientAuthGuard, extractAuthMetadata } from '@blue/auth-client';
import { authClient } from './auth-store';

/**
 * Adapts the `ClientAuthGuard` to work as a `RouterInterceptor`.
 *
 * This adapter intercepts route changes and checks authentication/authorization
 * metadata on the handler. If access is denied, it redirects to the configured
 * login or forbidden page.
 *
 * @since 0.0.1
 */
export class AuthRouterInterceptor implements RouterInterceptor {
    #guard: ClientAuthGuard;

    constructor(authClient: ClientAuthGuard) {
        this.#guard = authClient;
    }

    /**
     * Intercepts route navigation before it proceeds.
     * Checks auth metadata and redirects if necessary.
     */
    async preHandle(route: Route): Promise<boolean> {
        // Extract auth metadata from the current route
        const metadata = extractAuthMetadata(undefined);

        // If no auth required, allow the route
        if (!metadata.requiresAuth && metadata.requiredRoles.length === 0) {
            return true;
        }

        // Check if the user is authenticated
        if (!authClient.isAuthenticated) {
            // Redirect to login
            window.location.hash = '#/login';
            return false;
        }

        // Check role requirements
        if (metadata.requiredRoles.length > 0 && authClient.principal) {
            const hasRequiredRoles = metadata.requiredRoles.every((role) =>
                authClient.principal!.hasRole(role)
            );
            if (!hasRequiredRoles) {
                // Redirect to forbidden
                window.location.hash = '#/forbidden';
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
    loginRedirect: string = '#/login'
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
