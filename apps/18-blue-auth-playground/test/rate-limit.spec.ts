/**
 * Mode 4 — login rate limiting.
 *
 * `@rateLimit({ limit: 5, windowMs: 60_000 })` on both credential endpoints,
 * enforced by the platform's fixed-window limiter keyed on the **client
 * address**: the sixth attempt inside the window is denied as a `429` problem
 * document with `Retry-After`, another address keeps its own budget, and both
 * credential endpoints share one budget per address (the key is the address, not
 * the route). Routes without the metadata — here `/auth/me` — are untouched: the
 * interceptor is a metadata gate, so registering it changed no other route.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { LOGIN_RATE_LIMIT } from '../src/config';
import { bootMockPlayground, type MockHarness } from './harness';

/** One client address per test, so every bucket is exhausted from a known zero. */
const PEER = '203.0.113.7';
const OTHER_PEER = '203.0.113.8';
const JWT_PEER = '203.0.113.9';
const SHARED_PEER = '203.0.113.10';

describe('mode 4 — login rate limiting', () => {
    let harness: MockHarness;

    beforeAll(async () => {
        harness = await bootMockPlayground({ oidcEnabled: false });
    });

    afterAll(() => {
        harness.close();
    });

    /** One failed login attempt from `address`, on either credential endpoint. */
    function attempt(address: string, password = 'wrong', path = '/auth/login') {
        return harness.http
            .post(path)
            .headers({ 'content-type': 'application/json' })
            .remoteAddress(address)
            .body({ username: 'admin', password })
            .exec();
    }

    test('the sixth attempt in the window is 429 with Retry-After', async () => {
        for (let index = 0; index < LOGIN_RATE_LIMIT.limit; index += 1) {
            // oxlint-disable-next-line no-await-in-loop -- the fixed window is only genuinely exhausted when each attempt lands before the next.
            const res = await attempt(PEER);
            expect(res.response.status).toBe(401);
        }

        // Even a *correct* credential is refused while the budget is spent.
        const blocked = await attempt(PEER, 'demo');
        expect(blocked.response.status).toBe(429);
        const retryAfter = Number(blocked.response.headers['retry-after']);
        expect(Number.isInteger(retryAfter)).toBe(true);
        expect(retryAfter).toBeGreaterThan(0);
        expect(retryAfter).toBeLessThanOrEqual(LOGIN_RATE_LIMIT.windowMs / 1000);
        expect(String(blocked.response.headers['content-type'])).toContain('application/problem+json');
        expect(blocked.json()).toMatchObject({
            type: 'urn:blue:rate-limited',
            title: 'Too Many Requests',
            status: 429,
        });
    });

    test('another address keeps its own budget', async () => {
        const res = await attempt(OTHER_PEER, 'demo');
        expect(res.response.status).toBe(200);
    });

    test('the JWT login endpoint carries the same policy', async () => {
        for (let index = 0; index < LOGIN_RATE_LIMIT.limit; index += 1) {
            // oxlint-disable-next-line no-await-in-loop -- sequential attempts are what exhaust the fixed window.
            const res = await attempt(JWT_PEER, 'wrong', '/jwt/login');
            expect(res.response.status).toBe(401);
        }
        const blocked = await attempt(JWT_PEER, 'demo', '/jwt/login');
        expect(blocked.response.status).toBe(429);
        expect(Number(blocked.response.headers['retry-after'])).toBeGreaterThan(0);
    });

    test('both credential endpoints share one budget per client address', async () => {
        // The limiter's key is the address (documented in guide 11 §5), not the
        // route — a brute-force attacker cannot multiply the budget by rotating
        // between the cookie and the JWT login.
        for (let index = 0; index < LOGIN_RATE_LIMIT.limit; index += 1) {
            // oxlint-disable-next-line no-await-in-loop -- exhausting the shared bucket requires sequential attempts.
            const res = await attempt(SHARED_PEER);
            expect(res.response.status).toBe(401);
        }
        const firstJwtAttempt = await attempt(SHARED_PEER, 'demo', '/jwt/login');
        expect(firstJwtAttempt.response.status).toBe(429);
    });

    test('routes without @rateLimit metadata are not limited', async () => {
        for (let index = 0; index < LOGIN_RATE_LIMIT.limit + 3; index += 1) {
            // oxlint-disable-next-line no-await-in-loop -- proves the absence of a budget: the calls must all land.
            const res = await harness.http.get('/auth/me').remoteAddress(PEER).exec();
            expect(res.response.status).toBe(401);
        }
    });

    test('the demo advertises exactly the policy it enforces', () => {
        // The UI and the README both read this constant; drift would be a lie in
        // the panel, so it is pinned here.
        expect(LOGIN_RATE_LIMIT).toEqual({ limit: 5, windowMs: 60_000 });
    });
});
