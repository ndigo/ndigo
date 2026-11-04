/**
 * Environment-driven configuration for the auth playground: ports, the durable
 * session database, the session-cookie flags and the embedded OIDC issuer.
 *
 * Every knob has a working default, so `pnpm start` needs no environment at
 * all; the overrides exist to *demonstrate* the decisions (plain-HTTP cookie,
 * short JWT lifetime, a different database file) rather than to configure a
 * deployment.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
import { fileURLToPath } from 'node:url';
import { getEnv } from '@ndigo/context';
import { type RateLimitPolicy } from '@ndigo/rate-limit';
import { SESSION_COOKIE, type SessionCookieOptions } from '@ndigo/platform-node';

/** The password shared by every password-backed demo account. */
export const DEMO_PASSWORD = 'demo';

/**
 * Roles the embedded OIDC issuer grants its demo subject. The account exists in
 * the playground's user store too (with no password hash), so the session the
 * federated login issues resolves like any other.
 */
export const FEDERATED_ROLES = ['user', 'oidc'] as const;

/**
 * The credential endpoints' budget: 5 attempts per minute per client address
 * (SEC-6 — the brute-force surface). One constant, used by the `@rateLimit`
 * metadata and reported by the playground UI.
 */
export const LOGIN_RATE_LIMIT: RateLimitPolicy = { limit: 5, windowMs: 60_000 };

/**
 * Session-cookie name used when `Secure` is switched off over plain HTTP.
 *
 * The `__Host-` prefix of {@link SESSION_COOKIE} *mandates* `Secure` (plus
 * `Path=/` and no `Domain`), so `{ secure: false }` under that name fails
 * loudly by construction — a plain-HTTP run has to pick an unprefixed name and
 * read it back under the same name.
 */
export const PLAIN_HTTP_SESSION_COOKIE = 'ndigo-session';

/** Embedded OIDC issuer settings (mode 6). */
export interface OidcConfig {
    /** Start the in-process issuer at all. */
    readonly enabled: boolean;
    /** The issuer identifier — the discovery document's `issuer` must equal it. */
    readonly issuerUrl: string;
    /** The port the in-process issuer listens on. */
    readonly issuerPort: number;
    /** The single registered client id (a public PKCE client, no secret). */
    readonly clientId: string;
    /** `redirect_uri` registered for that client; must point at this server. */
    readonly redirectUri: string;
    /** The demo subject the embedded issuer knows (`oidc-provider` `sub`). */
    readonly accountId: string;
}

/** The playground's resolved configuration. */
export interface PlaygroundConfig {
    /** The HTTP port this server listens on. */
    readonly port: number;
    /** LibSQL URL of the durable session database (a `file:` URL in the demo). */
    readonly sessionDbUrl: string;
    /** Opaque-session lifetime in milliseconds. */
    readonly sessionTtlMs: number;
    /** The session cookie's name (see {@link PLAIN_HTTP_SESSION_COOKIE}). */
    readonly cookieName: string;
    /** Add `Secure` to the session cookie. */
    readonly cookieSecure: boolean;
    /** JWT adapter settings (HS256, short-lived access tokens). */
    readonly jwt: {
        readonly issuer: string;
        readonly audience: string;
        readonly secret: string;
        readonly accessTtlMs: number;
        readonly refreshTtlMs: number;
    };
    /** Embedded OIDC issuer settings. */
    readonly oidc: OidcConfig;
}

/** Reads an environment flag; anything but `false`/`0` is `true`. */
function flag(name: string, fallback: boolean): boolean {
    const raw = getEnv(name);
    if (raw === undefined || raw === '') return fallback;
    return raw.toLowerCase() !== 'false' && raw !== '0';
}

/** Reads an integer environment value, falling back on anything unparsable. */
function int(name: string, fallback: number): number {
    const raw = Number(getEnv(name));
    return Number.isSafeInteger(raw) && raw > 0 ? raw : fallback;
}

/** Env name of the durable-session database URL. */
export const SESSION_DB_URL_ENV = 'SESSION_DB_URL';

/**
 * Resolves the demo configuration from the environment.
 *
 * @returns The playground configuration; every value has a boot-safe default.
 */
export function loadConfig(): PlaygroundConfig {
    const port = int('PORT', 3110);
    const cookieSecure = flag('AUTH_COOKIE_SECURE', true);
    const oidcIssuerPort = int('OIDC_ISSUER_PORT', 3111);
    return {
        port,
        sessionDbUrl:
            getEnv(SESSION_DB_URL_ENV) ?? `file:${fileURLToPath(new URL('../tmp/sessions.db', import.meta.url))}`,
        sessionTtlMs: int('SESSION_TTL_MS', 30 * 60 * 1000),
        // The name follows the `Secure` flag: `__Host-` is invalid without it.
        cookieName: cookieSecure ? SESSION_COOKIE : PLAIN_HTTP_SESSION_COOKIE,
        cookieSecure,
        jwt: {
            issuer: getEnv('JWT_ISSUER') ?? 'ndigo-auth-playground',
            audience: getEnv('JWT_AUDIENCE') ?? 'ndigo-auth-playground-client',
            // Demo-only default: a committed secret is fine for a playground and
            // never for a deployment — set JWT_SECRET there (>= 32 bytes).
            secret: getEnv('JWT_SECRET') ?? 'ndigo-auth-playground-demo-hmac-secret',
            // 60 s access tokens: short enough to watch one expire by hand.
            accessTtlMs: int('JWT_ACCESS_TTL_MS', 60_000),
            refreshTtlMs: int('JWT_REFRESH_TTL_MS', 15 * 60 * 1000),
        },
        oidc: {
            enabled: flag('OIDC_ENABLED', true),
            // `127.0.0.1`, not `localhost`: the managed HTTP server binds the
            // loopback address by default (AD-36), so a `localhost` URL can
            // resolve to `::1` and miss the listener.
            issuerUrl: getEnv('OIDC_ISSUER_URL') ?? `http://127.0.0.1:${oidcIssuerPort}`,
            issuerPort: oidcIssuerPort,
            clientId: getEnv('OIDC_CLIENT_ID') ?? 'ndigo-auth-playground',
            redirectUri: getEnv('OIDC_REDIRECT_URI') ?? `http://127.0.0.1:${port}/oidc/callback`,
            accountId: getEnv('OIDC_ACCOUNT_ID') ?? 'oidc-demo',
        },
    };
}

/**
 * The `SessionCookieOptions` the playground hands to
 * `setSessionCookie`/`clearSessionCookie` — the one place the cookie flags are
 * decided, so login, rotation, OIDC and logout can never disagree.
 *
 * `HttpOnly`, `SameSite=Lax` and `Path=/` are framework defaults (see
 * `buildSessionCookie`); `Secure` is the documented flag this demo toggles.
 *
 * @param config - The resolved configuration.
 * @returns The cookie options for every session write.
 */
export function sessionCookieOptions(config: PlaygroundConfig): SessionCookieOptions {
    return { name: config.cookieName, secure: config.cookieSecure };
}
