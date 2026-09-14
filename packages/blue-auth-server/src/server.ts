/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { type Principal } from '@blue/auth-core';
import { AuthRegistry } from '@blue/auth-core';

/**
 * Server-side authentication coordinator.
 *
 * Responsible for validating incoming requests using the configured
 * authentication adapters and resolving the associated principal.
 */
export class AuthServer {
    /**
     * Validates a token using the appropriate adapter.
     *
     * @param adapterId - The ID of the adapter to use for validation.
     * @param token - The token to validate.
     * @returns The authenticated {@link Principal}, or `null` if validation fails.
     */
    async validate(adapterId: string, token: string): Promise<Principal | null> {
        const adapter = AuthRegistry.getAdapter(adapterId);
        if (!adapter) {
            throw new Error(`Authentication adapter '${adapterId}' not found`);
        }
        return adapter.validate(token);
    }

    /**
     * Validates a token against an explicit list of adapter IDs, returning
     * the first principal that verifies it.
     *
     * The adapter list is explicit and fail-closed: an unregistered adapter
     * ID throws rather than being silently skipped, so a token can never be
     * accepted by a scheme that was not deliberately selected. This matches
     * the documented security model — `AuthRouteGuard` validates against
     * exactly the adapters it was configured with; validating against *every*
     * registered adapter is not supported.
     *
     * @param token - The token to validate.
     * @param adapterIds - The adapters to try, in fallback order. An unknown
     *   ID throws.
     * @returns The authenticated {@link Principal}, or `null` if no listed
     *   adapter could validate the token.
     */
    async validateAny(token: string, adapterIds: string[]): Promise<Principal | null> {
        for (const adapterId of adapterIds) {
            const adapter = AuthRegistry.getAdapter(adapterId);
            if (!adapter) {
                throw new Error(`Authentication adapter '${adapterId}' not found`);
            }
            try {
                // oxlint-disable-next-line no-await-in-loop -- adapters form an ordered fallback chain; the first successful validation wins, so later adapters must not run early or in parallel.
                const principal = await adapter.validate(token);
                if (principal) return principal;
            } catch {
                // Continue to next adapter
            }
        }
        return null;
    }
}
