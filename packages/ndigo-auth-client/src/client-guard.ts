/**
 */
import { AUTH_REQUIRED_KEY, AUTH_ROLES_KEY } from '@ndigo/auth-core';
import { type AuthClient } from './client';

/**
 * Metadata for a route's authentication requirements.
 */
export interface AuthRouteMetadata {
    requiresAuth: boolean;
    requiredRoles: string[];
}

/**
 * Extracts authentication metadata from a route's handler.
 *
 * @param handler - The route handler object.
 * @returns The authentication metadata for the route.
 */
export function extractAuthMetadata(handler: object | undefined): AuthRouteMetadata {
    // constructor[Symbol.metadata] is a runtime TC39 decorator property
    // that TS 5.7's Function type doesn't declare. The property exists on
    // every decorated class's constructor at runtime.
    const metadata: Record<string, unknown> =
        (handler?.constructor as { [Symbol.metadata]?: Record<string, unknown> } | undefined)?.[Symbol.metadata] ?? {};
    const methodName: string | null =
        typeof (handler as unknown as Record<string, unknown>)?.method === 'string'
            ? ((handler as unknown as Record<string, unknown>).method as string)
            : null;

    const classRequiresAuth = Boolean(metadata[AUTH_REQUIRED_KEY]);
    const methodRequiresAuth = methodName ? Boolean(metadata[`${AUTH_REQUIRED_KEY}:${methodName}`]) : false;
    const classRoles = (metadata[AUTH_ROLES_KEY] as string[] | undefined) ?? [];
    const methodRoles = methodName ? ((metadata[`${AUTH_ROLES_KEY}:${methodName}`] as string[] | undefined) ?? []) : [];

    return {
        requiresAuth: classRequiresAuth || methodRequiresAuth,
        requiredRoles: [...classRoles, ...methodRoles],
    };
}

/**
 * A client-side guard for the Ndigo router that enforces authentication
 * and authorization requirements declared via the `@authenticated` and `@authorized` decorators.
 *
 * This guard prevents unauthorized access to views by checking the {@link AuthClient}
 * state before allowing navigation to proceed.
 */
export class ClientAuthGuard {
    #authClient: AuthClient;
    #loginRedirect: string;
    #forbiddenRedirect: string;

    /**
     * @param authClient - The client-side authentication manager.
     * @param loginRedirect - The route to redirect to if unauthenticated.
     * @param forbiddenRedirect - The route to redirect to if unauthorized.
     */
    constructor(authClient: AuthClient, loginRedirect: string = '/login', forbiddenRedirect: string = '/forbidden') {
        this.#authClient = authClient;
        this.#loginRedirect = loginRedirect;
        this.#forbiddenRedirect = forbiddenRedirect;
    }

    /**
     * Checks authentication and authorization requirements before navigation.
     *
     * @param handler - The route handler object.
     * @returns A redirect path if access is denied, or `null` to allow navigation.
     */
    async preNavigate(handler: object | undefined): Promise<string | null> {
        const metadata = extractAuthMetadata(handler);

        if (!metadata.requiresAuth && metadata.requiredRoles.length === 0) {
            return null;
        }

        if (!this.#authClient.isAuthenticated) {
            return this.#loginRedirect;
        }

        const principal = this.#authClient.principal;
        if (metadata.requiredRoles.length > 0 && principal) {
            // Narrowed local so the `.every` callback closes over a non-null principal.
            const hasRequiredRoles = metadata.requiredRoles.every((role) => principal.hasRole(role));
            if (!hasRequiredRoles) {
                return this.#forbiddenRedirect;
            }
        }

        return null;
    }

    /**
     * Updates the redirect paths.
     *
     * @param loginRedirect - The new login redirect path.
     * @param forbiddenRedirect - The new forbidden redirect path.
     */
    setRedirects(loginRedirect: string, forbiddenRedirect: string): void {
        this.#loginRedirect = loginRedirect;
        this.#forbiddenRedirect = forbiddenRedirect;
    }
}
