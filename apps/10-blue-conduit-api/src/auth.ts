/**
 * JWT authentication for the Conduit API.
 *
 * Tokens are minted and verified by `@blue/auth-server`'s `JWTAdapter`
 * (HS256, issuer/audience pinned, 24 h lifetime). The wire contract is the
 * RealWorld one: `Authorization: Token <jwt>` — no cookies, no sessions —
 * and a credential that is absent, malformed, expired, or minted for an
 * account that no longer exists is a `401`, never anonymity.
 *
 * Only the account id travels in the token (`sub`); every request re-reads
 * the account row, so a renamed user keeps working and a deleted one stops.
 *
 * @module blue-conduit-api
 * @since 1.0.0
 * @author Jeff Rose
 */
import { JWTAdapter } from '@blue/auth-server';
import { tokenInvalid, tokenMissing, type ConduitErrorView } from './errors';
import type { ConduitStore } from './store';
import type { User } from './entities';

/**
 * Development fallback signing secret. 43 bytes, comfortably above the
 * adapter's 32-byte HMAC minimum; production deployments set
 * `BLUE_CONDUIT_JWT_SECRET`.
 */
export const DEV_JWT_SECRET = 'blue-conduit-dev-jwt-secret-change-me-0123456789';

/** What an `Authorization` header says about the caller. */
type Identity = { status: 'missing' } | { status: 'invalid' } | { status: 'authenticated'; userId: number };

/** The outcome of resolving a request's caller. */
export type Authentication<TUser> = { ok: true; user: TUser } | { ok: false; response: ConduitErrorView };

/** Issues and validates Conduit JWTs. */
export class ConduitAuth {
    readonly #adapter: JWTAdapter;

    /**
     * Creates the auth component.
     *
     * @param secret - The HMAC signing secret (≥ 32 bytes).
     */
    constructor(secret: string = DEV_JWT_SECRET) {
        this.#adapter = new JWTAdapter({
            issuer: 'blue-conduit',
            audience: 'conduit-api',
            algorithm: 'HS256',
            secret,
            accessTokenTtlMs: 24 * 60 * 60 * 1000,
        });
    }

    /**
     * Mints the token returned by register/login/update responses.
     *
     * @param userId - The account id (`sub` claim).
     * @param username - The account's display name (`name` claim).
     * @returns The signed access token.
     */
    async issue(userId: number, username: string): Promise<string> {
        const { accessToken } = await this.#adapter.issueTokens({ id: String(userId), name: username });
        return accessToken;
    }

    /**
     * Classifies an `Authorization` header value.
     *
     * @param header - The raw header value, when the request carried one.
     * @returns Missing, invalid, or the authenticated account id.
     */
    async identify(header: string | undefined): Promise<Identity> {
        const match = typeof header === 'string' ? /^Token\s+(\S+)$/i.exec(header.trim()) : null;
        if (!match) {
            return { status: typeof header === 'string' && header.trim() !== '' ? 'invalid' : 'missing' };
        }
        const principal = await this.#adapter.validate(match[1]);
        const userId = principal ? Number(principal.id) : Number.NaN;
        return Number.isInteger(userId) ? { status: 'authenticated', userId } : { status: 'invalid' };
    }
}

/** What an `Authorization` header resolves to once checked against the store. */
type Caller = { status: 'anonymous' } | { status: 'invalid' } | { status: 'authenticated'; user: User };

/**
 * Verifies the header and loads the account it names.
 *
 * @param store - The persistence seam (account lookup).
 * @param auth - The JWT component.
 * @param header - The raw `Authorization` header, when the request carried one.
 * @returns Anonymous, invalid, or the authenticated account.
 */
async function resolveCaller(store: ConduitStore, auth: ConduitAuth, header: string | undefined): Promise<Caller> {
    const identity = await auth.identify(header);
    if (identity.status === 'missing') {
        return { status: 'anonymous' };
    }
    if (identity.status === 'invalid') {
        return { status: 'invalid' };
    }
    const user = store.findUserById(identity.userId);
    return user ? { status: 'authenticated', user } : { status: 'invalid' };
}

/**
 * Resolves the caller for an endpoint that demands one. A missing header
 * reports `is missing`; a present-but-unusable credential reports `is
 * invalid` — never anonymity.
 *
 * @param store - The persistence seam.
 * @param auth - The JWT component.
 * @param header - The raw `Authorization` header.
 * @returns The account, or the `401` response to return instead.
 */
export async function requireUser(
    store: ConduitStore,
    auth: ConduitAuth,
    header: string | undefined
): Promise<Authentication<User>> {
    const caller = await resolveCaller(store, auth, header);
    if (caller.status === 'authenticated') {
        return { ok: true, user: caller.user };
    }
    return { ok: false, response: caller.status === 'anonymous' ? tokenMissing() : tokenInvalid() };
}

/**
 * Resolves the caller for an endpoint whose auth is optional (the spec's
 * "Auth is optional" routes). No header means anonymous; an unusable
 * credential still fails closed with `401`.
 *
 * @param store - The persistence seam.
 * @param auth - The JWT component.
 * @param header - The raw `Authorization` header.
 * @returns The account or `null`, or the `401` response to return instead.
 */
export async function optionalUser(
    store: ConduitStore,
    auth: ConduitAuth,
    header: string | undefined
): Promise<Authentication<User | null>> {
    const caller = await resolveCaller(store, auth, header);
    if (caller.status === 'invalid') {
        return { ok: false, response: tokenInvalid() };
    }
    return { ok: true, user: caller.status === 'authenticated' ? caller.user : null };
}
