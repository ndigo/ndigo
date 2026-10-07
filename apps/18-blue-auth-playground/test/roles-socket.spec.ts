/**
 * Mode 3 (socket half) — the same `@authenticated` / `@authorized` contract on
 * a WebSocket endpoint, where the denial is the **close code** rather than
 * 401/403: `1008` with reason `authentication required` when the handshake
 * carries no valid principal, and `1008` with reason `insufficient role` when it
 * carries one that is not an admin.
 *
 * A real listener is used (`MockHTTP` has no socket path), and the credential
 * rides the upgrade URL as `?token=` — the only channel a browser `WebSocket`
 * has.
 *
 * @module blue-auth-playground
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { WebSocket } from 'ws';
import { recordOf, startPlaygroundServer, type ServerHarness } from './harness';

describe('mode 3 — role enforcement over a socket', () => {
    let harness: ServerHarness;
    let adminSession: string;
    let aliceSession: string;
    let adminAccessToken: string;
    const sockets: WebSocket[] = [];

    beforeAll(async () => {
        harness = await startPlaygroundServer({ oidcEnabled: false });
        adminSession = await sessionId('admin');
        aliceSession = await sessionId('alice');
        adminAccessToken = await accessToken('admin');
    }, 30_000);

    afterAll(async () => {
        for (const socket of sockets) {
            socket.close(1000, 'spec done');
        }
        await harness.close();
    });

    /** Logs in over the real server and returns the session id. */
    async function sessionId(username: string): Promise<string> {
        const res = await fetch(`${harness.baseUrl}/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password: 'demo' }),
        });
        expect(res.status).toBe(200);
        const session = recordOf(recordOf(await res.json())?.['session']);
        const id = session?.['id'];
        if (typeof id !== 'string') throw new Error('login returned no session id');
        return id;
    }

    /** Logs in over the real server and returns the JWT access token. */
    async function accessToken(username: string): Promise<string> {
        const res = await fetch(`${harness.baseUrl}/jwt/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password: 'demo' }),
        });
        expect(res.status).toBe(200);
        const token = recordOf(await res.json())?.['accessToken'];
        if (typeof token !== 'string') throw new Error('login returned no access token');
        return token;
    }

    /** Opens `/roles/socket` with an optional `?token=` credential. */
    function connect(token?: string): WebSocket {
        const query = token === undefined ? '' : `?token=${encodeURIComponent(token)}`;
        const socket = new WebSocket(`ws://127.0.0.1:${harness.port}/roles/socket${query}`);
        sockets.push(socket);
        socket.on('error', () => undefined);
        return socket;
    }

    /** Resolves with the socket's close code and reason. */
    function closed(socket: WebSocket): Promise<{ code: number; reason: string }> {
        const { promise, resolve } = Promise.withResolvers<{ code: number; reason: string }>();
        socket.once('close', (code: number, reason: Buffer) => resolve({ code, reason: reason.toString() }));
        return promise;
    }

    /** Resolves with the next inbound frame as text. */
    function nextMessage(socket: WebSocket): Promise<string> {
        const { promise, resolve } = Promise.withResolvers<string>();
        socket.once('message', (data: Buffer) => resolve(data.toString()));
        return promise;
    }

    test('an unauthenticated upgrade is closed 1008 "authentication required"', async () => {
        expect(await closed(connect())).toEqual({ code: 1008, reason: 'authentication required' });
    });

    test('a presented-but-unknown token is a failed authentication, not anonymity', async () => {
        expect(await closed(connect('not-a-credential'))).toEqual({
            code: 1008,
            reason: 'authentication required',
        });
    });

    test('a valid user session without the admin role is closed 1008 "insufficient role"', async () => {
        expect(await closed(connect(aliceSession))).toEqual({ code: 1008, reason: 'insufficient role' });
    });

    test('an admin session opens the socket, greets with its principal and echoes', async () => {
        const socket = connect(adminSession);
        const greeting = recordOf(JSON.parse(await nextMessage(socket)));
        expect(greeting).toMatchObject({
            mode: 'roles',
            surface: 'socket',
            requirement: '@authenticated + @authorized(admin)',
            principal: { id: 'admin', roles: ['admin'] },
        });

        socket.send('ping');
        const echoed = recordOf(JSON.parse(await nextMessage(socket)));
        expect(echoed).toMatchObject({ echo: 'ping', principalId: 'admin' });

        // A well-behaved client closes normally; the endpoint stays open until it does.
        const closing = closed(socket);
        socket.close(1000, 'spec done');
        expect(await closing).toEqual({ code: 1000, reason: 'spec done' });
    });

    test('a JWT access token opens the same socket (one guard, two schemes)', async () => {
        const socket = connect(adminAccessToken);
        const greeting = recordOf(JSON.parse(await nextMessage(socket)));
        expect(greeting).toMatchObject({ surface: 'socket', principal: { id: 'admin' } });
    });
});
