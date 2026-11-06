// @vitest-environment node
import { describe, test, beforeAll, afterAll, expect } from 'vitest';
import { bootApp, MockHTTP } from '@ndigo/test';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { SESSION_COOKIE, CSRFInterceptor } from '@ndigo/platform-node';
import { RadixMetadataHandlerMapping } from '@ndigo/dispatcher';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { initAuth } from '../src/auth-store';

/**
 * Cookie-session auth round-trip (AD-33 Wave 2) through the real
 * ndigo-api pipeline: login issues an HttpOnly session cookie, `/auth/me`
 * resolves it, logout clears + invalidates it.
 */
describe('ndigo-api cookie sessions (AD-33 Wave 2)', () => {
    let mockHTTP: MockHTTP;
    let close: () => void;

    beforeAll(() => {
        initAuth();
        const app = bootApp([ManagementAutoConfiguration, NodeAppConfiguration]);
        mockHTTP = new MockHTTP(app);
        close = app.close;
    });

    afterAll(() => {
        close();
    });

    /** Normalizes the MockHTTP Set-Cookie header (string or array) for assertions. */
    function cookieHeader(res: { response: { headers: Record<string, string | string[]> } }): string {
        const header = res.response.headers['set-cookie'];
        return Array.isArray(header) ? header.join('; ') : (header ?? '');
    }

    async function login(): Promise<{ token: string; setCookie: string }> {
        const res = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(res.response.status).toBe(200);
        const { token } = res.json() as { token?: string };
        expect(token).toBeDefined();
        return { token: token as string, setCookie: cookieHeader(res) };
    }

    test('login issues the session as an HttpOnly SameSite=Lax cookie', async () => {
        const { setCookie } = await login();
        expect(setCookie).toContain('__Host-ndigo-session=');
        expect(setCookie).toContain('HttpOnly');
        expect(setCookie).toContain('SameSite=Lax');
        expect(setCookie).toContain('Path=/');
        // The `__Host-` prefix mandates Secure — the cookie must carry it.
        expect(setCookie).toContain('Secure');
    });

    test('every login issues a fresh session (fixation-safe rotation)', async () => {
        const first = await login();
        const second = await login();
        expect(second.token).not.toBe(first.token);
    });

    test('GET /auth/me with the session cookie returns the principal', async () => {
        const { token } = await login();
        const me = await mockHTTP
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(me.response.status).toBe(200);
        expect(me.json()).toMatchObject({ name: 'admin', roles: ['admin', 'user'] });
    });

    test('GET /auth/me without a session cookie is 401', async () => {
        const me = await mockHTTP.get('/auth/me').exec();
        expect(me.response.status).toBe(401);
    });

    test('GET /auth/me with an unknown session is 401', async () => {
        const me = await mockHTTP
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: 'nope' })
            .exec();
        expect(me.response.status).toBe(401);
    });

    test('POST /auth/logout invalidates the session and clears the cookie', async () => {
        const { token } = await login();
        const logout = await mockHTTP
            .post('/auth/logout')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(logout.response.status).toBe(200);
        expect(logout.response.headers['set-cookie']).toContain('Max-Age=0');
        const me = await mockHTTP
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: token })
            .exec();
        expect(me.response.status).toBe(401);
    });

    test('login keeps its API-client contract: token in the body, 401 on bad credentials', async () => {
        const bad = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'bob', password: 'wrong' })
            .exec();
        expect(bad.response.status).toBe(401);
        expect(bad.json()).toMatchObject({ title: 'Unauthorized', status: 401, detail: 'Invalid credentials' });
    });

    test('login rejects form-encoded and other non-JSON bodies with 415 (SEC-AUD2-SEC-3)', async () => {
        // A cross-site HTML form cannot send `application/json` — browsers use
        // urlencoded, multipart, or text/plain. Rejecting those media types
        // closes the login-CSRF vector when a cookie-session app leaves the
        // opt-in `CSRFInterceptor` unwired.
        const form = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/x-www-form-urlencoded' })
            .rawBody('username=admin&password=demo')
            .exec();
        expect(form.response.status).toBe(415);
        expect(String(form.response.headers['content-type'])).toContain('application/problem+json');
        expect(form.json()).toMatchObject({ status: 415, title: 'Unsupported Media Type' });
        // No session is issued for a rejected body.
        expect(cookieHeader(form)).not.toContain('__Host-ndigo-session=');

        const textPlain = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'text/plain' })
            .rawBody('username=admin&password=demo')
            .exec();
        expect(textPlain.response.status).toBe(415);

        // The header is required: a body-bearing POST without it is rejected.
        // `.body()` defaults Content-Type to application/json (HTT-REV-015),
        // so the genuinely header-less request uses `rawBody`.
        const missingType = await mockHTTP.post('/auth/login').rawBody('{"username":"admin","password":"demo"}').exec();
        expect(missingType.response.status).toBe(415);
        expect(cookieHeader(missingType)).not.toContain('__Host-ndigo-session=');
    });

    test('POST /auth/login is rate limited per client address (SEC-6)', async () => {
        // Five attempts from one address are exhausted…
        for (let attempt = 0; attempt < 5; attempt += 1) {
            // oxlint-disable-next-line no-await-in-loop -- each attempt is a full request round trip that must land before the next so the fixed-window budget is genuinely exhausted.
            const res = await mockHTTP
                .post('/auth/login')
                .headers({ 'content-type': 'application/json' })
                .remoteAddress('203.0.113.7')
                .body({ username: 'bob', password: 'wrong' })
                .exec();
            expect(res.response.status).toBe(401);
        }
        // …the sixth is blocked with 429 + Retry-After.
        const blocked = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .remoteAddress('203.0.113.7')
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(blocked.response.status).toBe(429);
        expect(Number(blocked.response.headers['retry-after'])).toBeGreaterThan(0);
        expect(blocked.json()).toMatchObject({
            type: 'urn:ndigo:rate-limited',
            status: 429,
            title: 'Too Many Requests',
        });

        // A different address is unaffected.
        const other = await mockHTTP
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .remoteAddress('203.0.113.8')
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(other.response.status).toBe(200);
    });

    test('login and logout are CSRF-protected when the interceptor is wired (Wave 5)', async () => {
        // Dedicated boot: push the double-submit-cookie interceptor onto the
        // platform mapping (application-owned wiring; the default demo boot
        // stays without it because the mapping has one owner).
        const app = bootApp([ManagementAutoConfiguration, NodeAppConfiguration]);
        const mapping = app.context.getValue<RadixMetadataHandlerMapping>('handlerMapping');
        mapping.interceptors.push(new CSRFInterceptor());
        const mvc = new MockHTTP(app);
        try {
            // A first POST without a token is blocked 403 — and the
            // double-submit cookie is minted on the denial.
            const blocked = await mvc
                .post('/auth/login')
                .headers({ 'content-type': 'application/json' })
                .body({ username: 'admin', password: 'demo' })
                .exec();
            expect(blocked.response.status).toBe(403);
            const cookie = String(blocked.response.headers['set-cookie'] ?? '');
            expect(cookie).toContain('__Host-ndigo-csrf=');
            const token = /__Host-ndigo-csrf=([^;]+)/.exec(cookie)?.[1];
            expect(token).toBeDefined();

            // Cookie + matching header: the (rate-unlimited, distinct-peer)
            // login proceeds.
            const ok = await mvc
                .post('/auth/login')
                .headers({ 'content-type': 'application/json' })
                .cookies({ '__Host-ndigo-csrf': token as string })
                .headers({ 'x-csrf-token': token as string })
                .body({ username: 'admin', password: 'demo' })
                .exec();
            expect(ok.response.status).toBe(200);

            // A mismatched header stays blocked — auth mutations never run
            // without a genuine token.
            const bad = await mvc
                .post('/auth/login')
                .headers({ 'content-type': 'application/json' })
                .cookies({ '__Host-ndigo-csrf': token as string })
                .headers({ 'x-csrf-token': 'different' })
                .body({ username: 'admin', password: 'demo' })
                .exec();
            expect(bad.response.status).toBe(403);
        } finally {
            app.close();
        }
    });
});
