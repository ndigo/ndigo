/**
 * @module blue-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment jsdom
import { afterEach, beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { authClient, initAuth, login, logout } from '../src/auth-store';

const TOKEN_TTL_MS = 3_600_000;

/** Unwrap a successful demo login so assertions see the real session shape. */
async function demoLogin(username = 'alice', password = 'demo') {
    const session = await login(username, password);
    if (!session) {
        throw new Error(`expected demo login for '${username}' to succeed`);
    }
    return session;
}

describe('DemoAuthAdapter token lifecycle (auth-store)', () => {
    beforeAll(() => {
        initAuth();
    });

    beforeEach(async () => {
        sessionStorage.clear();
        await logout();
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    test('login issues a server-side session and authenticates the client', async () => {
        const session = await demoLogin();
        expect(session.principal.id).toBe('alice');
        expect(authClient.isAuthenticated).toBe(true);
    });

    test('failed credentials create no session', async () => {
        expect(await login('alice', 'wrong')).toBeNull();
        expect(authClient.isAuthenticated).toBe(false);
    });

    test('refresh extends the server-side lease, not just the reported one', async () => {
        // Regression (2026-11-02 review L2): refresh() used to compute the new
        // expiresAt without writing it back to the token store, so the server
        // kept the ORIGINAL deadline and the "extended" session died at the old
        // expiry — client and server disagreeing on lifetime is exactly the
        // wrong contract for the flagship tutorial to teach.
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
        const loginAt = Date.now();
        const originalExpiry = loginAt + TOKEN_TTL_MS;

        const session = await demoLogin();

        // 40 minutes in, refresh hands back a fresh full TTL…
        vi.setSystemTime(new Date(loginAt + 40 * 60_000));
        const refreshed = await authClient.refresh('demo');
        expect(refreshed.principal).toMatchObject({ id: 'alice' });
        expect(refreshed.token).toBe(session.token);
        expect(refreshed.expiresAt).toBe(Date.now() + TOKEN_TTL_MS);

        // …and 90 minutes after LOGIN — 30 minutes past the ORIGINAL expiry —
        // the persisted lease keeps the session valid on the server.
        vi.setSystemTime(new Date(originalExpiry + 30 * 60_000));
        await expect(authClient.validate('demo')).resolves.toMatchObject({ id: 'alice' });
    });

    test('refresh on an expired token fails closed without a state throw', async () => {
        vi.useFakeTimers({ toFake: ['Date'] });
        vi.setSystemTime(new Date('2026-11-02T12:00:00Z'));
        const loginAt = Date.now();

        await login('alice', 'demo');

        // Past the (never-refreshed) original expiry: refresh reports a dead
        // session (null principal/token/expiresAt), matching the demo's
        // fail-closed validate() behavior.
        vi.setSystemTime(new Date(loginAt + TOKEN_TTL_MS + 60_000));
        const dead = await authClient.refresh('demo');
        expect(dead.principal).toBeNull();
        expect(dead.token).toBeNull();
        expect(dead.expiresAt).toBeNull();
        expect(authClient.isAuthenticated).toBe(false);
    });
});
