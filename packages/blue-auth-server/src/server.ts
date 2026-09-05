/**
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
     * Validates a token using the first adapter that successfully verifies it.
     *
     * @param token - The token to validate.
     * @returns The authenticated {@link Principal}, or `null` if no adapter could validate the token.
     */
    async validateAny(token: string): Promise<Principal | null> {
        for (const adapter of AuthRegistry.getAllAdapters()) {
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
