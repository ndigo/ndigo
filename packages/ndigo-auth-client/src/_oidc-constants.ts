/**
 * OIDC adapter defaults.
 */

/** Signature algorithms accepted unless the config narrows them. */
export const DEFAULT_ALLOWED_ALGORITHMS = [
    'RS256',
    'RS384',
    'RS512',
    'ES256',
    'ES384',
    'ES512',
    'PS256',
    'PS384',
    'PS512',
    'EdDSA',
] as const;

/** Pending authorization requests live at most this long (default 10 minutes). */
export const DEFAULT_AUTHORIZATION_TTL_MS = 600_000;

/** Default cap for discovery/JWKS response bodies. */
export const DEFAULT_MAX_RESPONSE_BYTES = 1_048_576;

/** Default remote fetch timeout. */
export const DEFAULT_FETCH_TIMEOUT_MS = 10_000;

/** PKCE code-verifier length in bytes (RFC 7636 recommends 32 octets of entropy). */
export const CODE_VERIFIER_BYTES = 32;
