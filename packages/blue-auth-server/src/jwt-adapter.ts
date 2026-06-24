/**
 * @author Jeff Rose
 */

import { type AuthAdapter } from '@blue/auth-core';
import { type Principal } from '@blue/auth-core';
import { type AuthResult } from '@blue/auth-core';

/**
 * Configuration for the JWT adapter.
 */
export interface JWTAdapterConfig {
    /** The issuer (iss) claim to validate. */
    issuer: string;
    /** The audience (aud) claim to validate. */
    audience: string;
    /** The secret or public key used to verify the JWT signature. */
    secret: string;
    /** The algorithm used for signing (e.g., 'HS256', 'RS256'). */
    algorithm: string;
}

/**
 * A reference implementation of {@link AuthAdapter} for JWT-based authentication.
 *
 * This adapter validates JWT tokens and extracts the principal from the token claims.
 * It is intended as a starting point and should be extended for production use
 * to include proper key rotation, algorithm validation, and secure secret management.
 */
export class JWTAdapter implements AuthAdapter {
    readonly id = 'jwt';
    #config: JWTAdapterConfig;

    constructor(config: JWTAdapterConfig) {
        this.#config = config;
    }

    async validate(token: string): Promise<Principal | null> {
        try {
            // NOTE: This is a simplified implementation.
            // In production, use a proper JWT library like jose or jsonwebtoken.
            const parts = token.split('.');
            if (parts.length !== 3) {
                return null;
            }

            const payload = JSON.parse(
                Buffer.from(parts[1], 'base64').toString('utf-8')
            );

            // Validate issuer and audience
            if (payload.iss !== this.#config.issuer) {
                return null;
            }
            if (payload.aud !== this.#config.audience) {
                return null;
            }

            // Validate expiration
            if (payload.exp && payload.exp * 1000 < Date.now()) {
                return null;
            }

            return {
                id: payload.sub || 'unknown',
                name: payload.name || payload.email || 'Unknown',
                roles: payload.roles || [],
                hasRole: (role: string) => (payload.roles || []).includes(role),
                hasAnyRole: (...roles: string[]) =>
                    roles.some((r) => (payload.roles || []).includes(r)),
            };
        } catch {
            return null;
        }
    }

    async authenticate(_credentials: any): Promise<AuthResult> {
        // NOTE: This is a simplified implementation.
        // In production, validate credentials against a database or identity provider.
        throw new Error('JWTAdapter.authenticate() not implemented - use a proper auth flow');
    }

    async refresh(_token: string): Promise<AuthResult> {
        // NOTE: This is a simplified implementation.
        throw new Error('JWTAdapter.refresh() not implemented - use a proper token refresh flow');
    }

    async logout(_token: string): Promise<void> {
        // NOTE: JWTs are stateless, so logout typically involves
        // adding the token to a blacklist or waiting for expiration.
    }
}
