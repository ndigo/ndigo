/**
 * Mode 5 — durable sessions: a restart must not log anyone out.
 *
 * The spec is deliberately process-shaped: boot the app, log in, keep the
 * session id, **close the app**, boot a second app on the same database file and
 * present the very same id. It also pins that the store really is the LibSQL
 * one (not the in-memory reference), which is what makes the restart
 * survivable — and that an unknown id is still refused after the restart.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import { SESSION_COOKIE } from '@ndigo/platform-node';
import { bootMockPlayground, recordOf, sessionIdOf, type MockHarness } from './harness';

describe('mode 5 — durable sessions across a restart', () => {
    const directory = mkdtempSync(join(tmpdir(), 'ndigo-auth-playground-durable-'));
    const sessionDbUrl = `file:${join(directory, 'sessions.db')}`;
    const harnesses: MockHarness[] = [];

    afterAll(() => {
        for (const harness of harnesses) {
            harness.close();
        }
        rmSync(directory, { recursive: true, force: true });
    });

    /** Boots a playground-shaped app on the shared database file. */
    async function boot(): Promise<MockHarness> {
        const harness = await bootMockPlayground({ sessionDbUrl, oidcEnabled: false });
        harnesses.push(harness);
        return harness;
    }

    test('a session created before a restart still authenticates after it', async () => {
        const first = await boot();
        expect(first.runtime.stack.sessions.kind).toBe('libsql');

        const login = await first.http
            .post('/auth/login')
            .headers({ 'content-type': 'application/json' })
            .body({ username: 'admin', password: 'demo' })
            .exec();
        expect(login.response.status).toBe(200);
        const session = sessionIdOf(login.json());
        expect(
            (
                await first.http
                    .get('/auth/me')
                    .cookies({ [SESSION_COOKIE]: session })
                    .exec()
            ).response.status
        ).toBe(200);

        // The restart: this is not just a new context, it is a new store handle
        // on the same file (the app is closed, its LibSQL client disposed).
        first.close();

        const second = await boot();
        const persisted = await second.runtime.stack.sessions.get(session);
        expect(persisted).not.toBeNull();
        expect(persisted?.principal.id).toBe('admin');

        const me = await second.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        expect(me.response.status).toBe(200);
        expect(me.json()).toMatchObject({
            mode: 'cookie-session',
            principal: { id: 'admin', name: 'admin', roles: ['admin'] },
            session: { id: session },
        });

        // The guarded routes work off the restored session too.
        const guarded = await second.http
            .get('/roles/admin')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        expect(guarded.response.status).toBe(200);
    });

    test('a session that was logged out before the restart stays dead after it', async () => {
        const first = await boot();
        const session = sessionIdOf(
            (
                await first.http
                    .post('/auth/login')
                    .headers({ 'content-type': 'application/json' })
                    .body({ username: 'alice', password: 'demo' })
                    .exec()
            ).json()
        );
        const logout = await first.http
            .post('/auth/logout')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        expect(logout.response.status).toBe(200);
        first.close();

        const second = await boot();
        const me = await second.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        expect(me.response.status).toBe(401);
        expect(await second.runtime.stack.sessions.get(session)).toBeNull();
    });

    test('an unknown session id is refused before and after a restart', async () => {
        const first = await boot();
        const unknown = 'not-a-session-id';
        expect(
            (
                await first.http
                    .get('/auth/me')
                    .cookies({ [SESSION_COOKIE]: unknown })
                    .exec()
            ).response.status
        ).toBe(401);
        first.close();

        const second = await boot();
        expect(
            (
                await second.http
                    .get('/auth/me')
                    .cookies({ [SESSION_COOKIE]: unknown })
                    .exec()
            ).response.status
        ).toBe(401);
    });

    test('the durable store reports a rotation that survives the restart', async () => {
        const first = await boot();
        const session = sessionIdOf(
            (
                await first.http
                    .post('/auth/login')
                    .headers({ 'content-type': 'application/json' })
                    .body({ username: 'alice', password: 'demo' })
                    .exec()
            ).json()
        );
        const elevated = await first.http
            .post('/auth/elevate')
            .cookies({ [SESSION_COOKIE]: session })
            .exec();
        const rotated = recordOf(recordOf(elevated.json())?.['fixation'])?.['sessionId'];
        expect(typeof rotated).toBe('string');
        first.close();

        const second = await boot();
        expect(second.runtime.stack.sessions.kind).toBe('libsql');
        // The rotated id — and the elevated role — are on disk, not in a Map.
        const me = await second.http
            .get('/auth/me')
            .cookies({ [SESSION_COOKIE]: rotated as string })
            .exec();
        expect(me.response.status).toBe(200);
        expect(me.json()).toMatchObject({ principal: { id: 'alice', roles: ['user', 'admin'] } });
        // The pre-rotation id is gone for good.
        expect(
            (
                await second.http
                    .get('/auth/me')
                    .cookies({ [SESSION_COOKIE]: session })
                    .exec()
            ).response.status
        ).toBe(401);
    });
});
