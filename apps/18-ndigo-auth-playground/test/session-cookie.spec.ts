/**
 * Mode 1 — credentials + opaque session cookie, and the session-fixation gate.
 *
 * Asserts the cookie's flags as they appear in the raw `Set-Cookie` header (the
 * wire, not the framework's intentions), the fixation rotation on a privilege
 * change, and the fail-closed paths (`401` without a session, `415` for a
 * non-JSON login body).
 *
 * @module ndigo-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { SESSION_COOKIE } from '@ndigo/platform-node';
import { bootMockPlayground, recordOf, sessionIdOf, setCookieOf, type MockHarness } from './harness';

/** Shape the mode-1 login/me handlers answer with (asserted field by field). */
const COOKIE_VIEW = { name: SESSION_COOKIE, httpOnly: true, sameSite: 'Lax', path: '/', secure: true };

describe('mode 1 — opaque session cookie', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground();
    });

    afterAll(() => {
        harness.close();
    });

    /** Logs in and returns the response, the session id and the raw cookie header. */
    async function login(username = 'admin', password = 'demo') {
        const res = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username, password })
            .exec();
        return { res, setCookie: setCookieOf(res.response), body: res.json() };
    }

    test('login emits an HttpOnly, SameSite=Lax, Path=/, Secure __Host- cookie', async () => {
        const { res, setCookie } = await login();
        expect(res.response.status).toBe(200);
        expect(setCookie).toContain(`${SESSION_COOKIE}=`);
        expect(setCookie).toContain('HttpOnly');
        expect(setCookie).toContain('SameSite=Lax');
        expect(setCookie).toContain('Path=/');
        // The `__Host-` prefix mandates Secure; emitting it without would have
        // thrown rather than silently dropping the cookie in a browser.
        expect(setCookie).toContain('Secure');
    });

    test('the response reports the same cookie attributes it emitted', async () => {
        const { body } = await login();
        expect(body).toMatchObject({
            mode: 'cookie-session',
            surface: 'http',
            principal: { id: 'admin', name: 'admin', roles: ['admin'] },
            rateLimit: { limit: 5, windowMs: 60_000, header: 'Retry-After' },
        });
        expect(recordOf(recordOf(body)?.['session'])?.['cookie']).toEqual(COOKIE_VIEW);
    });

    test('every login issues a fresh session id (fixation-safe issuance)', async () => {
        const first = sessionIdOf((await login()).body);
        const second = sessionIdOf((await login()).body);
        expect(second).not.toBe(first);
    });

    test('GET /auth/me resolves the session cookie', async () => {
        const { body } = await login('alice');
        const token = sessionIdOf(body);
        const me = await harness.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(me.response.status).toBe(200);
        expect(me.json()).toMatchObject({ mode: 'cookie-session', principal: { id: 'alice', roles: ['user'] } });
    });

    test('GET /auth/me also accepts a Bearer session id (API-client path)', async () => {
        const token = sessionIdOf((await login()).body);
        const me = await harness.http
            .get('/auth/me')
            .headers({ authorization: `Bearer ${token}` })
            .exec();
        expect(me.response.status).toBe(200);
    });

    test('GET /auth/me is 401 without a credential', async () => {
        const me = await harness.http.get('/auth/me').exec();
        expect(me.response.status).toBe(401);
        expect(me.json()).toMatchObject({ status: 401, title: 'Unauthorized' });
    });

    test('GET /auth/me is 401 for an unknown session id', async () => {
        const me = await harness.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: 'not-a-session' })
            .exec();
        expect(me.response.status).toBe(401);
    });

    test('logout invalidates the session and clears the cookie', async () => {
        const token = sessionIdOf((await login()).body);
        const logout = await harness.http
            .post('/auth/logout')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(logout.response.status).toBe(200);
        expect(setCookieOf(logout.response)).toContain('Max-Age=0');
        const me = await harness.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(me.response.status).toBe(401);
    });

    test('login rejects a non-JSON body with 415 and issues no cookie', async () => {
        const form = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .rawBody('username=admin&password=demo')
            .exec();
        expect(form.response.status).toBe(415);
        expect(String(form.response.headers['content-type'])).toContain('application/problem+json');
        expect(setCookieOf(form.response)).not.toContain(`${SESSION_COOKIE}=`);
    });

    test('login answers one generic 401 for bad credentials', async () => {
        const bad = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'wrong' })
            .exec();
        expect(bad.response.status).toBe(401);
        expect(bad.json()).toMatchObject({ status: 401, title: 'Unauthorized', detail: 'invalid_credentials' });
        expect(setCookieOf(bad.response)).not.toContain(`${SESSION_COOKIE}=`);
    });

    test('unknown users and wrong passwords are indistinguishable', async () => {
        const unknown = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'nobody', password: 'demo' })
            .exec();
        const wrongPassword = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'alice', password: 'nope' })
            .exec();
        expect(unknown.response.status).toBe(wrongPassword.response.status);
        expect(unknown.json()).toEqual(wrongPassword.json());
    });

    test('a privilege change rotates the session id and kills the old one', async () => {
        const original = sessionIdOf((await login()).body);
        // Before elevation the admin-only route is 403 for a plain `user`… so
        // elevate `alice`, whose roles only gain `admin` through this call.
        const alice = sessionIdOf((await login('alice')).body);
        const denied = await harness.http
            .get('/roles/admin')
            .cookies({ [SESSION_COOKIE]: alice })
            .exec();
        expect(denied.response.status).toBe(403);

        const elevated = await harness.http
            .post('/auth/elevate')
            .cookies({ [SESSION_COOKIE]: alice })
            .exec();
        expect(elevated.response.status).toBe(200);
        const rotated = recordOf(elevated.json());
        const fixation = recordOf(rotated?.['fixation']);
        expect(fixation).toMatchObject({ previousSessionId: alice, rotated: true });
        const newId = fixation?.['sessionId'];
        expect(typeof newId).toBe('string');
        expect(newId).not.toBe(alice);
        // The rotated id is the cookie that went out with this response.
        expect(setCookieOf(elevated.response)).toContain(`${SESSION_COOKIE}=`);
        expect(rotated?.['principal']).toMatchObject({ id: 'alice', roles: ['user', 'admin'] });

        // The old id is dead; the new one carries the new privilege.
        const stale = await harness.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: alice })
            .exec();
        expect(stale.response.status).toBe(401);
        const granted = await harness.http
            .get('/roles/admin')
            .cookies({ [SESSION_COOKIE]: newId as string })
            .exec();
        expect(granted.response.status).toBe(200);

        // …and the original admin session is untouched by the rotation.
        const stillThere = await harness.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: original })
            .exec();
        expect(stillThere.response.status).toBe(200);
    });

    test('elevate without a live session is 401', async () => {
        const elevated = await harness.http.post('/auth/elevate').exec();
        expect(elevated.response.status).toBe(401);
    });
});
