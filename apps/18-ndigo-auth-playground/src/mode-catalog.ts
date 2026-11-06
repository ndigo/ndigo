/**
 * The mode catalog: what each mode is, the endpoints that make it up, and the
 * security property it demonstrates.
 *
 * One source for the server-rendered page (the shell renders it without
 * JavaScript), the interactive client (which reads the rendered DOM) and the
 * README's matrix — so the three can never disagree.
 */
import { LOGIN_RATE_LIMIT } from './config';

/** One authentication mode's description. */
export interface ModeEntry {
    /** Stable mode id — the `mode` field every response body carries. */
    readonly id: string;
    /** Short title. */
    readonly title: string;
    /** The HTTP/socket surface of the mode. */
    readonly endpoints: readonly string[];
    /** The security property this mode puts on display. */
    readonly demonstrates: string;
}

/** Every mode, in the order the page presents them. */
export const MODE_CATALOG: readonly ModeEntry[] = [
    {
        id: 'cookie-session',
        title: '1 · Credentials + opaque session cookie',
        endpoints: ['POST /auth/login', 'GET /auth/me', 'POST /auth/elevate', 'POST /auth/logout'],
        demonstrates:
            'Opaque 32-byte session ids issued by a durable store, delivered as an HttpOnly / SameSite=Lax / Path=/ cookie — Secure (and the __Host-ndigo-session name that mandates it) behind AUTH_COOKIE_SECURE. JSON-only login (415 otherwise) is the login-CSRF gate, and a privilege change rotates the session id so a planted id never survives elevation.',
    },
    {
        id: 'jwt',
        title: '2 · JWT access + refresh tokens',
        endpoints: ['POST /jwt/login', 'GET /jwt/me', 'POST /jwt/refresh'],
        demonstrates:
            'HS256 access tokens with a 60 s lifetime and a refresh path that rotates the family: refresh advances the account tokenVersion, so every older access token and the presented refresh token die at once. Expired vs invalid vs missing are distinguishable 401 problems (code: token_expired / token_invalid / token_missing).',
    },
    {
        id: 'roles',
        title: '3 · Roles and permissions',
        endpoints: ['GET /roles/authenticated', 'GET /roles/admin', 'GET /roles/user', 'WS /roles/socket'],
        demonstrates:
            '@authenticated / @authorized enforced by a metadata guard over either scheme: 401 without a credential, 403 with the wrong role, and on the socket surface the same failure as a 1008 close (reason "authentication required" or "insufficient role"). admin and alice hold disjoint roles, so every row is a real denial.',
    },
    {
        id: 'rate-limit',
        title: `4 · Login rate limiting (${LOGIN_RATE_LIMIT.limit}/${LOGIN_RATE_LIMIT.windowMs / 60_000} min per address)`,
        endpoints: ['POST /auth/login', 'POST /jwt/login'],
        demonstrates:
            'The @rateLimit metadata on both credential endpoints, enforced by the platform fixed-window limiter: the sixth attempt inside the window answers 429 + Retry-After as a urn:ndigo:rate-limited problem, while other addresses keep their own budget.',
    },
    {
        id: 'durable-sessions',
        title: '5 · Durable sessions (LibSQL)',
        endpoints: ['POST /auth/login', 'GET /auth/me'],
        demonstrates:
            'The session store is @ndigo/orm-drizzle LibSQLSessionStore on a file-backed database, not a Map: sessions created before a restart still resolve after one. The store also owns rotation (atomic, expiry-preserving) and the live-session cap.',
    },
    {
        id: 'oidc',
        title: '6 · OIDC authorization code + PKCE',
        endpoints: ['GET /oidc/start', 'GET /oidc/callback', 'GET /oidc/refresh'],
        demonstrates:
            'A real authorization-code + PKCE flow (state, nonce, S256 verifier) against the oidc-provider issuer embedded in this process: discovery, JWKS-verified ID token, and then a local opaque session — the federated subject must exist as an account here, or it is refused 403. The provider refresh token (`offline_access`) is captured server-side — the browser never sees it — and /oidc/refresh redeems it with single-use rotation, re-verifying the refreshed ID token.',
    },
];
