/**
 * JWT claim readers shared by the server and client adapters.
 */

/**
 * A verified JWT payload read structurally, so this package stays free of a
 * `jose` dependency.
 */
export type JWTClaims = Readonly<Record<string, unknown>>;

/**
 * Reads the `roles` claim: an array of strings, with non-string entries
 * dropped.
 *
 * @param payload - The verified JWT claims.
 * @returns The role strings, or an empty array when the claim is absent.
 */
export function readRoles(payload: JWTClaims): string[] {
    const raw = payload.roles;
    if (!Array.isArray(raw)) return [];
    return raw.filter((role): role is string => typeof role === 'string');
}

/**
 * Reads the OAuth scope claims:
 * - `scope`: space-delimited (RFC 6749)
 * - `scp`: array or space-delimited (Azure AD)
 * - `scopes`: array (custom IdPs)
 *
 * @param payload - The verified JWT claims.
 * @returns The deduplicated, non-empty scope strings.
 */
export function readScopes(payload: JWTClaims): string[] {
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
