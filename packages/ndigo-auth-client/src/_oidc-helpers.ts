/**
 * Internal helpers for the OIDC adapter: URL trust checks, PKCE, claim
 * extraction, and principal construction. Underscore-prefixed: do not import
 * across packages.
 */
import { createHash } from 'node:crypto';
import { type JWTPayload, base64url } from 'jose';
import { type Principal } from '@ndigo/auth-core';
import { OIDCError } from './oidc-types';

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

export async function pkceCodeChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return base64url.encode(new Uint8Array(digest));
}

export function readRoles(payload: JWTPayload): string[] {
    const raw = payload.roles;
    if (!Array.isArray(raw)) return [];
    return raw.filter((role): role is string => typeof role === 'string');
}

export function readScopes(payload: JWTPayload): string[] {
    // OAuth 2.0 `scope` is space-delimited; Azure AD's `scp` may be an array
    // or a space-delimited string; `scopes` is the custom-IdP array.
    const scopeClaim = payload.scope;
    const scpClaim = payload.scp;
    const scopesClaim = payload.scopes;
    const parts = [
        ...(typeof scopeClaim === 'string' ? scopeClaim.split(/\s+/u) : []),
        ...(Array.isArray(scpClaim) ? scpClaim : typeof scpClaim === 'string' ? scpClaim.split(/\s+/u) : []),
        ...(Array.isArray(scopesClaim) ? scopesClaim : []),
    ];
    return [...new Set(parts.filter((scope): scope is string => typeof scope === 'string' && scope.length > 0))];
}

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
    const roleSet = new Set(roles);
    const scopeSet = new Set(scopes);
    return {
        id: sub,
        name:
            (typeof payload.name === 'string' && payload.name) ||
            (typeof payload.preferred_username === 'string' && payload.preferred_username) ||
            'Unknown',
        roles,
        scopes,
        hasRole: (role: string) => roleSet.has(role),
        hasAnyRole: (...wanted: string[]) => wanted.some((role) => roleSet.has(role)),
        hasScope: (scope: string) => scopeSet.has(scope),
        hasAnyScope: (...wanted: string[]) => wanted.some((scope) => scopeSet.has(scope)),
    };
}

export function hashRefreshToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
}
