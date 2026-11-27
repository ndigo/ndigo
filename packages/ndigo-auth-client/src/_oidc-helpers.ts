/**
 * Internal helpers for the OIDC adapter: URL trust checks, PKCE, claim
 * extraction, and principal construction. Underscore-prefixed: do not import
 * across packages.
 */
import { createHash } from 'node:crypto';
import { type JWTPayload, base64url } from 'jose';
import { type Principal, DefaultPrincipal, readRoles, readScopes } from '@ndigo/auth-core';
import { OIDCError } from './oidc-types';

/**
 * Reports whether `hostname` is a loopback address (localhost, 127.x, ::1, …).
 *
 * @param hostname - The hostname to test.
 * @returns `true` when the host is loopback.
 */
export function isLoopbackHost(hostname: string): boolean {
    const host = hostname.toLowerCase().replace(/^\[|\]$/g, '');
    return (
        host === 'localhost' ||
        host === '::1' ||
        host === '::ffff:127.0.0.1' ||
        (host.startsWith('127.') && host.split('.').length === 4) ||
        host.endsWith('.localhost')
    );
}

/**
 * Enforces HTTPS (loopback exempt) for every remote URL the adapter fetches
 * or redirects to.
 */
export function assertTrustedUrl(url: URL, label: string): void {
    if (url.protocol !== 'https:' && !isLoopbackHost(url.hostname)) {
        throw new OIDCError(
            'configuration',
            `${label} must use HTTPS (loopback exempt): ${url.protocol} is not allowed`
        );
    }
}

/**
 * Computes the PKCE S256 code challenge for a verifier.
 *
 * @param verifier - The PKCE code verifier.
 * @returns The base64url-encoded SHA-256 challenge.
 */
export async function pkceCodeChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64url.encode(new Uint8Array(digest));
}

/**
 * Builds a {@link Principal} from a verified JWT payload.
 *
 * @param payload - The verified JWT payload.
 * @returns The constructed principal.
 */
export function principalFromPayload(payload: JWTPayload): Principal {
    const sub = payload.sub;
    // #assertClaims rejects any token without a non-empty string `sub`; this guard
    // keeps that invariant explicit and fails closed if the helper is ever reached
    // from an unverified path.
    if (typeof sub !== 'string' || sub.length === 0) {
        throw new OIDCError('invalid_token', 'ID token is missing a non-empty subject (sub) claim');
    }
    const roles = readRoles(payload);
    const scopes = readScopes(payload);
    const name =
        (typeof payload.name === 'string' && payload.name) ||
        (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
        'Unknown';
    return new DefaultPrincipal(sub, name, roles, scopes);
}

/**
 * Hashes a refresh token for use as a store key (never store the raw bearer).
 *
 * @param token - The refresh token.
 * @returns The SHA-256 hex digest.
 */
export function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
