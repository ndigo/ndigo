/**
 * Mode 2's expiry arm: with a short access-token lifetime, the token really
 * expires, the failure is `token_expired` (not `token_invalid`), and the
 * documented client flow — refresh once, retry — recovers.
 *
 * A separate spec file because the token lifetime is fixed at boot
 * (`JWT_ACCESS_TTL_MS`), and each Vitest file gets its own worker, so the short
 * lifetime cannot leak into the other JWT cases.
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootMockPlayground, recordOf, type MockHarness } from './harness';

/**
 * Three seconds of access-token lifetime.
 *
 * `exp` is a whole-second claim (`jose` floors the epoch), so a 1-second
 * lifetime would leave a 0–1000 ms validity window — a fresh-token check could
 * race it. Three seconds keeps the "while fresh it works" assertion ~2 s clear
 * of the boundary while still expiring within one test.
 */
const ACCESS_TTL_MS = 3_000;

/** Comfortably past the token's `exp` (a whole-second claim, so ≤ 4 s ahead). */
const EXPIRY_WAIT_MS = 4_600;

describe('mode 2 — expired access token and the refresh flow', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground({ jwtAccessTtlMs: ACCESS_TTL_MS });
    });

    afterAll(() => {
        harness.close();
    });

    test('an expired access token answers 401 token_expired, then refresh recovers', async () => {
        const login = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'alice', password: 'demo' })
            .exec();
        expect(login.response.status).toBe(200);
        const issued = recordOf(login.json());
        expect(issued).toMatchObject({ expiresInMs: ACCESS_TTL_MS });
        const accessToken = issued?.['accessToken'];
        const refreshToken = issued?.['refreshToken'];
        expect(typeof accessToken).toBe('string');
        expect(typeof refreshToken).toBe('string');

        // While fresh, the token works.
        const fresh = await harness.http
            .get('/jwt/me')
            .headers({ authorization: `Bearer ${accessToken as string}` })
            .exec();
        expect(fresh.response.status).toBe(200);

        // Wait out the lifetime, then retry: the failure is labelled expired.
        const waited = Promise.withResolvers<void>();
        setTimeout(waited.resolve, EXPIRY_WAIT_MS);
        await waited.promise;
        const expired = await harness.http
            .get('/jwt/me')
            .headers({ authorization: `Bearer ${accessToken as string}` })
            .exec();
        expect(expired.response.status).toBe(401);
        expect(recordOf(expired.json())).toMatchObject({
            type: 'urn:ndigo-auth-playground:jwt',
            status: 401,
            code: 'token_expired',
        });

        // The client flow: refresh once, then retry with the new access token.
        const refreshed = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: refreshToken as string })
            .exec();
        expect(refreshed.response.status).toBe(200);
        const rotated = recordOf(refreshed.json());
        const nextAccess = rotated?.['accessToken'];
        expect(typeof nextAccess).toBe('string');

        const recovered = await harness.http
            .get('/jwt/me')
            .headers({ authorization: `Bearer ${nextAccess as string}` })
            .exec();
        expect(recovered.response.status).toBe(200);
        expect(recovered.json()).toMatchObject({ mode: 'jwt', principal: { id: 'alice' } });
    });

    test('an expired token of an unknown secret is still labelled token_invalid', async () => {
        // The label must not rely on `exp` alone: a well-formed, long-expired
        // token signed with the wrong key is *invalid*, and the verified path
        // (the adapter) is what decides.
        const header = Buffer.from('{"alg":"HS256"}').toString('base64url');
        const payload = Buffer.from(
            JSON.stringify({
                sub: 'admin',
                iss: harness.config.jwt.issuer,
                aud: harness.config.jwt.audience,
                exp: Math.floor(Date.now() / 1000) - 60,
            })
        ).toString('base64url');
        const res = await harness.http
            .get('/jwt/me')
            .headers({ authorization: `Bearer ${header}.${payload}.forged` })
            .exec();
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({ code: 'token_invalid' });
    });
});
