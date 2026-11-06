/**
 * Mode 1's cookie flag, switched off: `AUTH_COOKIE_SECURE=false` over plain
 * HTTP.
 *
 * The demo exists to show the flag's consequences: `Secure` disappears from the
 * `Set-Cookie` header, and the cookie *name* has to change with it —
 * `__Host-ndigo-session` mandates `Secure`, so the schema-blessed name for this
 * mode is the unprefixed `ndigo-session`. Everything else (HttpOnly,
 * SameSite=Lax, Path=/) is fixed by the framework and stays.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { SESSION_COOKIE } from '@ndigo/platform-node';
import { PLAIN_HTTP_SESSION_COOKIE } from '../src/config';
import { bootMockPlayground, recordOf, sessionIdOf, setCookieOf, type MockHarness } from './harness';

describe('mode 1 — session cookie without Secure (plain-HTTP flag)', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground({ cookieSecure: false });
    });

    afterAll(() => {
        harness.close();
    });

    test('the config reports the plain-HTTP session cookie', () => {
        expect(harness.config.cookieSecure).toBe(false);
        expect(harness.config.cookieName).toBe(PLAIN_HTTP_SESSION_COOKIE);
    });

    test('login emits an unprefixed cookie with no Secure attribute', async () => {
        const res = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        const setCookie = setCookieOf(res.response);
        expect(res.response.status).toBe(200);
        expect(setCookie).toContain(`${PLAIN_HTTP_SESSION_COOKIE}=`);
        expect(setCookie).not.toContain('Secure');
        expect(setCookie).not.toContain(`${SESSION_COOKIE}=`);
        expect(setCookie).toContain('HttpOnly');
        expect(setCookie).toContain('SameSite=Lax');
        expect(setCookie).toContain('Path=/');
        expect(recordOf(recordOf(res.json())?.['session'])?.['cookie']).toEqual({
            name: PLAIN_HTTP_SESSION_COOKIE,
            httpOnly: true,
            sameSite: 'Lax',
            path: '/',
            secure: false,
        });
    });

    test('the unprefixed cookie authenticates and logs out', async () => {
        const login = await harness.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'alice', password: 'demo' })
            .exec();
        const token = sessionIdOf(login.json());
        const me = await harness.http
            .get('/auth/me')
            .cookies({ [PLAIN_HTTP_SESSION_COOKIE]: token })
            .exec();
        expect(me.response.status).toBe(200);
        const logout = await harness.http
            .post('/auth/logout')
            .cookies({ [PLAIN_HTTP_SESSION_COOKIE]: token })
            .exec();
        expect(logout.response.status).toBe(200);
        expect(setCookieOf(logout.response)).toContain('Max-Age=0');
        expect(setCookieOf(logout.response)).not.toContain('Secure');
    });
});
