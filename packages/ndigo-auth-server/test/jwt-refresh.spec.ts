/**
 * @module ndigo-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { jwtVerify, type JWTPayload } from 'jose';
import { createHmac } from 'node:crypto';
import { type UserRecord, DefaultPrincipal } from '@ndigo/auth-core';
import { delay } from '@ndigo/test';
import { JWTAdapter, JWTTokenError } from '../src/jwt-adapter';
import { InMemoryUserStore } from '../src/in-memory-user-store';

/** 32+ byte HMAC secret (SE-2 rejects keys below 256 bits). */
const TEST_SECRET = 'demo-secret-0123456789abcdefghijklmnop';

function createJWT(payload: JWTPayload, secret = TEST_SECRET): string {
    const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
    return `${header}.${body}.${signature}`;
}

const CONFIG = {
    issuer: 'https://ndigo.example.com',
    audience: 'ndigo-api',
    secret: TEST_SECRET,
    algorithm: 'HS256',
};

function buildAdapter(options: { revocationCacheTtlMs?: number } = {}) {
    const userStore = new InMemoryUserStore([
        { id: 'alice', username: 'alice', passwordHash: null, roles: ['user'], tokenVersion: 3 },
        { id: 'bob', username: 'bob', passwordHash: null, disabled: true },
    ]);
    const adapter = new JWTAdapter({ ...CONFIG, userStore, ...options });
    return { adapter, userStore };
}

async function claimsOf(token: string): Promise<JWTPayload> {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(CONFIG.secret), {
        issuer: CONFIG.issuer,
        audience: CONFIG.audience,
        algorithms: [CONFIG.algorithm],
    });
    return payload;
}

describe('JWTAdapter token issuance (AD-33 D-7)', () => {
    test('issueTokens mints access + refresh tokens carrying the current version', async () => {
        const { adapter } = buildAdapter();
        const issued = await adapter.issueTokens({ id: 'alice' });
        expect(issued.accessToken).not.toBe(issued.refreshToken);

        const access = await claimsOf(issued.accessToken);
        expect(access.sub).toBe('alice');
        expect(access.name).toBe('alice');
        expect(access.roles).toEqual(['user']);
        expect(access.ver).toBe(3); // store snapshot, not the passed default
        expect(access.token_use).toBe('access');

        const refresh = await claimsOf(issued.refreshToken);
        expect(refresh.ver).toBe(3);
        expect(refresh.token_use).toBe('refresh');
    });

    test('issueTokens reads the store version, never a stale subject value', async () => {
        const { adapter } = buildAdapter();
        const issued = await adapter.issueTokens({ id: 'alice', tokenVersion: 99 });
        expect((await claimsOf(issued.accessToken)).ver).toBe(3);
    });

    test('issueTokens fails closed on an unknown user when a store is wired', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.issueTokens({ id: 'ghost' })).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('issueTokens rejects asymmetric configurations (no private key available)', async () => {
        const adapter = new JWTAdapter({
            issuer: 'x',
            audience: 'y',
            publicKey: 'pem',
            algorithm: 'RS256',
        });
        await expect(adapter.issueTokens({ id: 'alice' })).rejects.toBeInstanceOf(JWTTokenError);
    });
});

describe('JWTAdapter revocation via ver claim (AD-33 D-7)', () => {
    test('validate accepts an access token while its version is current', async () => {
        const { adapter } = buildAdapter();
        const { accessToken } = await adapter.issueTokens({ id: 'alice' });
        const principal = await adapter.validate(accessToken);
        expect(principal).toMatchObject({ id: 'alice', roles: ['user'] });
    });

    test('validate rejects a refresh token: only access tokens authenticate (SE-7)', async () => {
        const { adapter } = buildAdapter();
        const { accessToken, refreshToken } = await adapter.issueTokens({ id: 'alice' });
        await expect(adapter.validate(accessToken)).resolves.toMatchObject({ id: 'alice' });
        // The refresh token carries sub/ver/exp and a signature — without a
        // token_use gate it would authenticate for its full 7-day TTL.
        await expect(adapter.validate(refreshToken)).resolves.toBeNull();
    });

    test('a version bump revokes every outstanding token', async () => {
        const { adapter, userStore } = buildAdapter();
        const { accessToken, refreshToken } = await adapter.issueTokens({ id: 'alice' });
        await userStore.incrementTokenVersion('alice');
        await expect(adapter.validate(accessToken)).resolves.toBeNull();
        await expect(adapter.refresh(refreshToken)).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('external tokens without a ver claim are unaffected by the store', async () => {
        const { adapter, userStore } = buildAdapter();
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        const external = createJWT({
            sub: 'alice',
            name: 'Alice',
            iss: CONFIG.issuer,
            aud: CONFIG.audience,
            exp: futureTime,
        });
        await userStore.incrementTokenVersion('alice');
        await expect(adapter.validate(external)).resolves.toMatchObject({ id: 'alice', name: 'Alice' });
    });

    test('a disabled account cannot be issued tokens', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.issueTokens({ id: 'bob' })).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('disabling an account revokes its outstanding tokens at validation (SE-7)', async () => {
        const { adapter, userStore } = buildAdapter();
        const { accessToken, refreshToken } = await adapter.issueTokens({ id: 'alice' });
        await expect(adapter.validate(accessToken)).resolves.toMatchObject({ id: 'alice' });

        const alice = await userStore.findById('alice');
        expect(alice).not.toBeNull();
        userStore.upsert({ ...(alice as UserRecord), disabled: true });

        await expect(adapter.validate(accessToken)).resolves.toBeNull();
        await expect(adapter.refresh(refreshToken)).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('a token for an already-disabled account never validates (SE-7)', async () => {
        const { adapter } = buildAdapter();
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        const token = createJWT({
            sub: 'bob',
            ver: 0,
            iss: CONFIG.issuer,
            aud: CONFIG.audience,
            exp: futureTime,
        });

        await expect(adapter.validate(token)).resolves.toBeNull();
    });
});

describe('JWTAdapter refresh rotation (AD-33 D-7)', () => {
    test('refresh issues a new access + refresh pair and advances the family version', async () => {
        const { adapter, userStore } = buildAdapter();
        const { refreshToken } = await adapter.issueTokens({ id: 'alice' });
        const result = await adapter.refresh(refreshToken);
        expect(result.token).toBeDefined();
        expect(result.refreshToken).not.toBe(refreshToken);
        expect(result.refreshToken).not.toBe(result.token);
        expect(result.principal).toBeInstanceOf(DefaultPrincipal);
        expect(result.principal?.id).toBe('alice');

        const next = await userStore.findById('alice');
        expect(next?.tokenVersion).toBe(4);
        expect((await claimsOf(result.token)).ver).toBe(4);
        expect((await claimsOf(result.refreshToken)).ver).toBe(4);
        // The new pair works…
        expect((await adapter.validate(result.token))?.id).toBe('alice');
        const again = await adapter.refresh(result.refreshToken);
        expect(again.principal?.id).toBe('alice');
        // …and the pre-refresh access token is dead (family advanced).
    });

    test('a rotated-out refresh token is rejected (reuse detection by version)', async () => {
        const { adapter } = buildAdapter();
        const { accessToken, refreshToken } = await adapter.issueTokens({ id: 'alice' });
        await adapter.refresh(refreshToken);
        await expect(adapter.refresh(refreshToken)).rejects.toBeInstanceOf(JWTTokenError);
        await expect(adapter.validate(accessToken)).resolves.toBeNull();
    });

    test('concurrent refreshes of one token: exactly one wins (SEC-6 CAS)', async () => {
        const { adapter, userStore } = buildAdapter();
        const { refreshToken } = await adapter.issueTokens({ id: 'alice' });
        const results = await Promise.allSettled([adapter.refresh(refreshToken), adapter.refresh(refreshToken)]);
        const ok = results.filter((r) => r.status === 'fulfilled');
        const rejected = results.filter((r) => r.status === 'rejected');
        expect(ok).toHaveLength(1);
        expect(rejected).toHaveLength(1);
        const reason = rejected[0].reason;
        expect(reason).toBeInstanceOf(JWTTokenError);
        expect((reason as Error).message).toMatch(/superseded|revoked/i);
        // The family advanced exactly once — one atomic bump, not two.
        expect((await userStore.findById('alice'))?.tokenVersion).toBe(4);
    });

    test('an access token cannot be used as refresh input', async () => {
        const { adapter } = buildAdapter();
        const { accessToken } = await adapter.issueTokens({ id: 'alice' });
        await expect(adapter.refresh(accessToken)).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('junk and unknown-user refresh tokens are rejected', async () => {
        const { adapter } = buildAdapter();
        await expect(adapter.refresh('not-a-jwt')).rejects.toBeInstanceOf(JWTTokenError);
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        const ghost = createJWT({
            sub: 'ghost',
            ver: 0,
            token_use: 'refresh',
            iss: CONFIG.issuer,
            aud: CONFIG.audience,
            exp: futureTime,
        });
        await expect(adapter.refresh(ghost)).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('refresh requires a user store (revocation is versioning)', async () => {
        const adapter = new JWTAdapter(CONFIG);
        await expect(adapter.refresh('x')).rejects.toBeInstanceOf(JWTTokenError);
        await expect(adapter.logout('x')).rejects.toBeInstanceOf(JWTTokenError);
    });
});

describe('JWTAdapter logout (AD-33 D-7)', () => {
    test('logout bumps the version and invalidates the whole family', async () => {
        const { adapter, userStore } = buildAdapter();
        const { accessToken, refreshToken } = await adapter.issueTokens({ id: 'alice' });
        await adapter.logout(accessToken);
        expect((await userStore.findById('alice'))?.tokenVersion).toBe(4);
        await expect(adapter.validate(accessToken)).resolves.toBeNull();
        await expect(adapter.refresh(refreshToken)).rejects.toBeInstanceOf(JWTTokenError);
    });

    test('logout rejects an unverifiable token without touching anything', async () => {
        const { adapter, userStore } = buildAdapter();
        await expect(adapter.logout('junk')).rejects.toBeInstanceOf(JWTTokenError);
        expect((await userStore.findById('alice'))?.tokenVersion).toBe(3);
    });
});

describe('JWTAdapter revocation cache (AD-33 D-7)', () => {
    test('a short-TTL version cache defers revocation visibility', async () => {
        const { adapter, userStore } = buildAdapter({ revocationCacheTtlMs: 40 });
        const { accessToken } = await adapter.issueTokens({ id: 'alice' });
        // Prime the cache with the current version…
        await expect(adapter.validate(accessToken)).resolves.toMatchObject({ id: 'alice' });
        await userStore.incrementTokenVersion('alice');
        // …within the TTL the cached (old) version still validates…
        await expect(adapter.validate(accessToken)).resolves.toMatchObject({ id: 'alice' });
        // …after expiry the store is read and the token is dead.
        await delay(60);
        await expect(adapter.validate(accessToken)).resolves.toBeNull();
    });

    // Explicit budget: filling the cache is deliberately 10k sequential
    // sign+verify ops (~0.4s locally); a cold CI run (no cache, every project
    // contending a 2-core runner) starved it past the 5s default (#94).
    test('the cache is bounded: at the cap the oldest entry is evicted (2026-11-02 review L1)', async () => {
        // The bound is observable behavior, not a private poke: once the cap is
        // crossed, the oldest sub's live entry is gone — so its revocation takes
        // effect immediately instead of waiting out the (here: 60 s) TTL.
        const MAX = 10_000;
        const futureTime = Math.floor(Date.now() / 1000) + 3600;
        const users: UserRecord[] = Array.from({ length: MAX + 1 }, (_, i) => ({
            id: `user-${i}`,
            username: `user-${i}`,
            passwordHash: null,
            roles: ['user'],
            tokenVersion: 0,
        }));
        const userStore = new InMemoryUserStore(users);
        const adapter = new JWTAdapter({ ...CONFIG, userStore, revocationCacheTtlMs: 60_000 });

        const token = (sub: string, ver: number) =>
            createJWT({ sub, ver, iss: CONFIG.issuer, aud: CONFIG.audience, exp: futureTime });

        // Fill the cache: MAX distinct subs, all entries still within TTL.
        for (let i = 0; i < MAX; i++) {
            // oxlint-disable-next-line no-await-in-loop -- insertion ORDER is the test: sequential awaits establish the Map's FIFO order that the eviction assertion depends on.
            await expect(adapter.validate(token(`user-${i}`, 0))).resolves.toMatchObject({ id: `user-${i}` });
        }

        // Revoking user-0 now would be hidden by its cached version for 60 s…
        await userStore.incrementTokenVersion('user-0');
        await expect(adapter.validate(token('user-0', 0))).resolves.toMatchObject({ id: 'user-0' });

        // …but inserting the (MAX+1)-th sub forces the oldest eviction.
        await expect(adapter.validate(token(`user-${MAX}`, 0))).resolves.toMatchObject({ id: `user-${MAX}` });

        // user-0 is no longer cached: the stale token dies at once, proving the
        // map never grows past the cap and eviction targets the oldest entry.
        await expect(adapter.validate(token('user-0', 0))).resolves.toBeNull();
        await expect(adapter.validate(token('user-0', 1))).resolves.toMatchObject({ id: 'user-0' });
    }, 30_000);
});
