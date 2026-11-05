/**
 * Mode 2 — JWT access + refresh tokens.
 *
 * The point of the mode is the *failure taxonomy* and the rotation: a missing
 * token, a malformed one, an expired one and a refused refresh are four
 * distinguishable `401` problems, and a successful refresh kills every older
 * token of the account by construction (the `ver` counter advances).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { bootMockPlayground, recordOf, type MockHarness } from './harness';

/** The token pair a login or refresh returns. */
interface TokenPair {
    readonly accessToken: string;
    readonly refreshToken: string;
}

describe('mode 2 — JWT access + refresh', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground();
    });

    afterAll(() => {
        harness.close();
    });

    /** Logs in through `/jwt/login` and returns the token pair. */
    async function jwtLogin(username = 'alice'): Promise<TokenPair> {
        const res = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username, password: 'demo' })
            .exec();
        expect(res.response.status).toBe(200);
        const body = recordOf(res.json());
        const accessToken = body?.['accessToken'];
        const refreshToken = body?.['refreshToken'];
        expect(typeof accessToken).toBe('string');
        expect(typeof refreshToken).toBe('string');
        return { accessToken: accessToken as string, refreshToken: refreshToken as string };
    }

    /** Calls `/jwt/me` with an access token. */
    function me(token: string) {
        return harness.http
            .get('/jwt/me')
            .headers({ authorization: `Bearer ${token}` })
            .exec();
    }

    test('login issues a 60-second HS256 access token plus a refresh token', async () => {
        const res = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'alice', password: 'demo' })
            .exec();
        const body = recordOf(res.json());
        expect(body).toMatchObject({
            mode: 'jwt',
            tokenType: 'Bearer',
            principal: { id: 'alice', name: 'alice', roles: ['user'] },
            expiresInMs: 60_000,
            refreshEndpoint: 'POST /jwt/refresh',
        });
        const expiresAt = body?.['expiresAt'];
        expect(typeof expiresAt).toBe('number');
        expect(Math.abs((expiresAt as number) - (Date.now() + 60_000))).toBeLessThan(5_000);
    });

    test('GET /jwt/me validates the access token and reports its expiry', async () => {
        const { accessToken } = await jwtLogin();
        const res = await me(accessToken);
        expect(res.response.status).toBe(200);
        const body = recordOf(res.json());
        expect(body).toMatchObject({ mode: 'jwt', principal: { id: 'alice', roles: ['user'] } });
        const expiresAt = body?.['accessTokenExpiresAt'];
        expect(typeof expiresAt).toBe('number');
        expect(expiresAt as number).toBeGreaterThan(Date.now());
    });

    test('GET /jwt/me without a token is 401 token_missing', async () => {
        const res = await harness.http.get('/jwt/me').exec();
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({
            type: 'urn:ndigo-auth-playground:jwt',
            status: 401,
            code: 'token_missing',
        });
        // No `WWW-Authenticate` assertion here: `ResponseEntityView` renders a
        // handler-returned 4xx body from a fixed header set, so the challenge
        // argument the handlers pass is dropped on this path. The denial
        // finalizer *does* emit it for interceptor denials — asserted in
        // `roles-http.spec.ts`. Reported as a framework gap in the README.
    });

    test('GET /jwt/me with a garbage token is 401 token_invalid', async () => {
        const res = await me('not.a.jwt');
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({ code: 'token_invalid' });
    });

    test('GET /jwt/me with a token from another secret is 401 token_invalid', async () => {
        // Header/payload of a syntactically valid JWT with a bogus signature:
        // the shape is decodable, so only verification fails.
        const forged = `${Buffer.from('{"alg":"HS256"}').toString('base64url')}.${Buffer.from(
            '{"sub":"admin","iss":"ndigo-auth-playground","aud":"ndigo-auth-playground-client","exp":9999999999}'
        ).toString('base64url')}.signature`;
        const res = await me(forged);
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({ code: 'token_invalid' });
    });

    test('a refresh token never authenticates a request', async () => {
        const { refreshToken } = await jwtLogin();
        const res = await me(refreshToken);
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({ code: 'token_invalid' });
    });

    test('refresh rotates the pair and kills the tokens it replaced', async () => {
        const first = await jwtLogin();
        const refreshed = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: first.refreshToken })
            .exec();
        expect(refreshed.response.status).toBe(200);
        const rotated = recordOf(refreshed.json());
        expect(rotated).toMatchObject({ mode: 'jwt', rotated: true, principal: { id: 'alice' } });
        const accessToken = rotated?.['accessToken'];
        const refreshToken = rotated?.['refreshToken'];
        expect(typeof accessToken).toBe('string');
        expect(typeof refreshToken).toBe('string');
        expect(accessToken).not.toBe(first.accessToken);
        expect(refreshToken).not.toBe(first.refreshToken);

        // The new pair works…
        expect((await me(accessToken as string)).response.status).toBe(200);
        expect(
            (
                await harness.http
                    .post('/jwt/refresh')
                    .headers({ 'content-type': 'application/json' })
                    .body({ refreshToken: refreshToken as string })
                    .exec()
            ).response.status
        ).toBe(200);

        // …and the rotated-out access token is dead (the `ver` counter moved).
        const staleAccess = await me(first.accessToken);
        expect(staleAccess.response.status).toBe(401);
        expect(recordOf(staleAccess.json())).toMatchObject({ code: 'token_invalid' });
    });

    test('replaying a rotated-out refresh token is 401 refresh_rejected', async () => {
        const first = await jwtLogin();
        const once = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: first.refreshToken })
            .exec();
        expect(once.response.status).toBe(200);

        const replay = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: first.refreshToken })
            .exec();
        expect(replay.response.status).toBe(401);
        expect(recordOf(replay.json())).toMatchObject({
            type: 'urn:ndigo-auth-playground:jwt',
            status: 401,
            code: 'refresh_rejected',
        });
    });

    test('refresh rejects an access token, an unknown token and no token at all', async () => {
        const { accessToken } = await jwtLogin();
        const asRefresh = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: accessToken })
            .exec();
        expect(recordOf(asRefresh.json())).toMatchObject({ code: 'refresh_rejected' });

        const garbage = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({ refreshToken: 'nope' })
            .exec();
        expect(recordOf(garbage.json())).toMatchObject({ code: 'refresh_rejected' });

        const empty = await harness.http
            .post('/jwt/refresh')
            .headers({ 'content-type': 'application/json' })
            .body({})
            .exec();
        expect(empty.response.status).toBe(401);
        expect(recordOf(empty.json())).toMatchObject({ code: 'refresh_rejected' });
    });

    test('refresh accepts the token from the Authorization header too', async () => {
        const { refreshToken } = await jwtLogin();
        const res = await harness.http
            .post('/jwt/refresh')
            .headers({ authorization: `Bearer ${refreshToken}`, 'content-type': 'application/json' })
            .body({})
            .exec();
        expect(res.response.status).toBe(200);
        expect(recordOf(res.json())).toMatchObject({ rotated: true });
    });

    test('login rejects bad credentials and non-JSON bodies', async () => {
        const bad = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'alice', password: 'wrong' })
            .exec();
        expect(bad.response.status).toBe(401);
        expect(recordOf(bad.json())).toMatchObject({ code: 'invalid_credentials' });

        const form = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .rawBody('username=alice&password=demo')
            .exec();
        expect(form.response.status).toBe(415);
    });

    test('the federated account has no password to trade for tokens', async () => {
        // `oidc-demo` exists as an account (so its OIDC session resolves) but
        // carries no password hash — the JWT mode must not mint tokens for it.
        const res = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: harness.config.oidc.accountId, password: 'demo' })
            .exec();
        expect(res.response.status).toBe(401);
        expect(recordOf(res.json())).toMatchObject({ code: 'invalid_credentials' });
    });
});
