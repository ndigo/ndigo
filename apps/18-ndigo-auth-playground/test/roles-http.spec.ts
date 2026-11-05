/**
 * Mode 3 (HTTP half) — the role matrix, enforced by `@authenticated` /
 * `@authorized` through the app's dual-scheme guard.
 *
 * `admin` holds `admin` only and `alice` holds `user` only, so each row is a
 * real success *and* a real denial: `401` without a credential, `403` with the
 * wrong role. The scheme is deliberately orthogonal — the same matrix answers
 * for an opaque session id and for a JWT access token — and a duplicated
 * session cookie fails closed.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { SESSION_COOKIE } from '@ndigo/platform-node';
import { bootMockPlayground, recordOf, sessionIdOf, type MockHarness } from './harness';

describe('mode 3 — role enforcement over HTTP', () => {
    let harness: MockHarness;
    let adminSession: string;
    let aliceSession: string;
    let adminAccessToken: string;
    let aliceAccessToken: string;

    beforeAll(async () => {
        harness = await bootMockPlayground({ oidcEnabled: false });
        adminSession = sessionIdOf((await sessionLogin('admin')).json());
        aliceSession = sessionIdOf((await sessionLogin('alice')).json());
        adminAccessToken = await jwtAccessToken('admin');
        aliceAccessToken = await jwtAccessToken('alice');
    });

    afterAll(() => {
        harness.close();
    });

    /** Logs in through mode 1 (opaque session). */
    function sessionLogin(username: string) {
        return harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username, password: 'demo' })
            .exec();
    }

    /** Logs in through mode 2 and returns the access token. */
    async function jwtAccessToken(username: string): Promise<string> {
        const res = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username, password: 'demo' })
            .exec();
        const token = recordOf(res.json())?.['accessToken'];
        if (typeof token !== 'string') throw new Error('no access token');
        return token;
    }

    /** Calls a role route with a session cookie. */
    function withSession(path: string, session: string) {
        return harness.http
            .get(path)
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
    }

    /** Calls a role route with a Bearer access token. */
    function withAccessToken(path: string, token: string) {
        return harness.http
            .get(path)
            .headers({ authorization: `Bearer ${token}` })
            .exec();
    }

    const ROUTES = ['/roles/authenticated', '/roles/admin', '/roles/user'];

    test('every role route is 401 without a credential', async () => {
        for (const route of ROUTES) {
            // oxlint-disable-next-line no-await-in-loop -- three independent routes are asserted in declaration order; each dispatches through the same pipeline.
            const res = await harness.http.get(route).exec();
            expect(res.response.status).toBe(401);
            expect(res.json()).toMatchObject({ status: 401, title: 'Unauthorized', type: 'urn:ndigo:unauthorized' });
            expect(String(res.response.headers['www-authenticate'])).toContain('Bearer');
        }
    });

    test('an unknown session id is 401 (never a principal)', async () => {
        const res = await withSession('/roles/authenticated', 'nope');
        expect(res.response.status).toBe(401);
    });

    test('admin passes /roles/authenticated and /roles/admin, and is refused /roles/user', async () => {
        const any = await withSession('/roles/authenticated', adminSession);
        expect(any.response.status).toBe(200);
        expect(any.json()).toMatchObject({
            mode: 'roles',
            surface: 'http',
            requirement: '@authenticated',
            principal: { id: 'admin', roles: ['admin'] },
        });

        const admin = await withSession('/roles/admin', adminSession);
        expect(admin.response.status).toBe(200);
        expect(admin.json()).toMatchObject({ requirement: '@authenticated + @authorized(admin)' });

        const forbidden = await withSession('/roles/user', adminSession);
        expect(forbidden.response.status).toBe(403);
        expect(forbidden.json()).toMatchObject({ status: 403, title: 'Forbidden', type: 'urn:ndigo:forbidden' });
    });

    test('alice is refused /roles/admin and passes /roles/user', async () => {
        const forbidden = await withSession('/roles/admin', aliceSession);
        expect(forbidden.response.status).toBe(403);

        const user = await withSession('/roles/user', aliceSession);
        expect(user.response.status).toBe(200);
        expect(user.json()).toMatchObject({
            requirement: '@authenticated + @authorized(user)',
            principal: { id: 'alice', roles: ['user'] },
        });
    });

    test('the same matrix answers for a JWT access token', async () => {
        const authenticated = await withAccessToken('/roles/authenticated', aliceAccessToken);
        expect(authenticated.response.status).toBe(200);
        expect(authenticated.json()).toMatchObject({ principal: { id: 'alice' } });

        const user = await withAccessToken('/roles/user', aliceAccessToken);
        expect(user.response.status).toBe(200);

        const forbidden = await withAccessToken('/roles/admin', aliceAccessToken);
        expect(forbidden.response.status).toBe(403);

        const admin = await withAccessToken('/roles/admin', adminAccessToken);
        expect(admin.response.status).toBe(200);
    });

    test('a duplicated session cookie fails closed with 401 (cookie tossing)', async () => {
        // Two cookies under the session name are attacker-controlled ambiguity:
        // the guard treats the request as unauthenticated rather than picking
        // the first or last occurrence — even when one of them is valid.
        const res = await harness.http
            .get('/roles/authenticated')
            .headers({ cookie: `${SESSION_COOKIE}=${adminSession}; ${SESSION_COOKIE}=planted` })
            .exec();
        expect(res.response.status).toBe(401);
    });

    test('a refresh token is not a credential on the guarded routes', async () => {
        const login = await harness.http
            .post('/jwt/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        const refreshToken = recordOf(login.json())?.['refreshToken'];
        expect(typeof refreshToken).toBe('string');
        const res = await withAccessToken('/roles/admin', refreshToken as string);
        expect(res.response.status).toBe(401);
    });

    test('logout ends the guarded routes for that session', async () => {
        const session = sessionIdOf((await sessionLogin('admin')).json());
        expect((await withSession('/roles/admin', session)).response.status).toBe(200);
        const logout = await harness.http
            .post('/auth/logout')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        expect(logout.response.status).toBe(200);
        expect((await withSession('/roles/admin', session)).response.status).toBe(401);
    });
});
