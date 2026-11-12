/**
 * End-to-end STOMP demo gate (AD-23 Phase 4): the ndigo-api STOMP chat
 * destination consumed through `StompClient` over the `@ndigo/socket`
 * `WebSocketClient` — the node global WHATWG `WebSocket` transport, same
 * wire as a browser.
 *
 * Boots the real application stack on an ephemeral port, logs in through
 * `/auth/login`, connects two `StompClient`s to `/stomp/chat` (the endpoint
 * is `@authenticated`, so the demo token rides the upgrade URL), and
 * asserts the destination fan-out (including the sender when subscribed),
 * receipt-resolved sends, the scheduler-driven `chat-tick` (scheduler →
 * broker, D5), and deliberate disconnect teardown. A dedicated case pins
 * the socket-side auth gate: an upgrade without a principal is closed with
 * `1008` (SEC-3).
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import type { ApplicationContext } from '@ndigo/context';
import { ApplicationBuilder } from '@ndigo/boot';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { NodeAutoConfiguration, HTTPServer } from '@ndigo/platform-node';
import { WebSocketClient, StompClient, type StompSubscription, bodyAsText } from '@ndigo/socket';
import { WebSocket } from 'ws';
import { NodeAppConfiguration } from '../src/node-app-configuration';
import { ServerConfig } from '../src/server-config';
import { initAuth } from '../src/auth-store';

/**
 * Collects a subscription's messages until the session ends.
 *
 * @param sub - The subscription.
 * @returns The collected bodies and a promise completing on stream end.
 */
function collect(sub: StompSubscription): { bodies: string[]; done: Promise<void> } {
    const bodies: string[] = [];
    const done = (async () => {
        for await (const message of sub.messages) {
            bodies.push(bodyAsText(message.body));
        }
    })();
    return { bodies, done };
}

/**
 * Polls until `predicate` holds (the chat e2e idiom).
 *
 * @param predicate - The condition.
 * @param timeoutMs - Fail the wait after this many milliseconds.
 */
async function waitFor(predicate: () => boolean, timeoutMs: number): Promise<void> {
    const started = Date.now();
    while (!predicate()) {
        if (Date.now() - started > timeoutMs) {
            throw new Error('timed out waiting for STOMP demo condition');
        }
        // oxlint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated condition; batching would change the poll semantics.
        await new Promise<void>((resolve) => setTimeout(resolve, 25));
    }
}

describe('ndigo-api STOMP chat via StompClient (AD-23 D6)', () => {
    let context: ApplicationContext;
    let wsUrl: string;
    let token: string;
    const clients: WebSocketClient[] = [];

    beforeAll(async () => {
        initAuth();
        process.env['PORT'] = '0'; // ephemeral port for the real http server
        context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            ServerConfig,
            NodeAppConfiguration,
        ])
            .properties({ 'server.port': '0', 'server.name': 'stomp-spec' })
            .run();

        const server = context.getValue<HTTPServer>('httpServer');
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        const port = bound.address()?.port;
        wsUrl = `ws://127.0.0.1:${port}`;

        // `/stomp/chat` is `@authenticated` (SEC-3): the socket
        // authenticator entry resolves the token from the upgrade URL, so the
        // suite logs in once through the app's own endpoint.
        const login = await fetch(`http://127.0.0.1:${port}/auth/login`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username: 'admin', password: 'demo' }),
        });
        expect(login.status).toBe(200);
        const credentials: unknown = await login.json();
        if (typeof credentials !== 'object' || credentials === null || !('token' in credentials)) {
            throw new Error('login response carried no token');
        }
        token = String(credentials.token);
    }, 30_000);

    afterAll(async () => {
        for (const client of clients) {
            client.close(1000, 'spec done');
        }
        context.close();
        delete process.env['PORT'];
    });

    const stomp = (): StompClient => {
        const socket = new WebSocketClient(`${wsUrl}/stomp/chat?token=${token}`, { reconnect: null });
        clients.push(socket);
        return new StompClient(socket, { host: 'stomp-spec', reconnect: false });
    };

    test('an unauthenticated upgrade to /stomp/chat is closed with 1008', async () => {
        // No token ⇒ no principal ⇒ the @authenticated metadata check fails
        // closed at dispatch, before the broker ever sees the connection.
        const socket = new WebSocket(`${wsUrl}/stomp/chat`);
        socket.on('error', () => undefined);
        const closed = await new Promise<number>((resolve) => {
            socket.on('close', (code: number) => resolve(code));
        });
        expect(closed).toBe(1008);
    });

    test('an Authorization: Bearer header is an accepted upgrade credential', async () => {
        // The second channel the demo authenticator accepts (browsers cannot
        // set headers on the WS handshake; non-browser clients can). A
        // resolved principal lets the @authenticated endpoint's upgrade
        // complete instead of closing 1008.
        const socket = new WebSocket(`${wsUrl}/stomp/chat`, {
            headers: { authorization: `Bearer ${token}` },
        });
        socket.on('error', () => undefined);
        await new Promise<void>((resolve, reject) => {
            socket.once('open', resolve);
            socket.once('close', (code: number) => reject(new Error(`upgrade refused with ${code}`)));
        });
        socket.close(1000, 'done');
    });

    test('a SEND from one client is fanned out to subscribers, echo included', async () => {
        const a = stomp();
        const b = stomp();
        await waitFor(() => a.connected.value, 5_000);
        await waitFor(() => b.connected.value, 5_000);

        const subA = a.subscribe('/topic/chat', { id: 'spec-a' });
        const subB = b.subscribe('/topic/chat', { id: 'spec-b' });
        const fromA = collect(subA);
        const fromB = collect(subB);

        // Sync handshake: b sends a probe and awaits its own echo. The
        // broker processes frames FIFO per connection, so the echo proves
        // b's SUBSCRIBE is registered before the real SEND fans out —
        // otherwise a's SEND could race ahead of b's subscription.
        const probe = { event: 'chat', data: 'probe' };
        await b.send('/topic/chat', probe);
        await waitFor(
            () => fromB.bodies.some((body) => JSON.stringify(JSON.parse(body)) === JSON.stringify(probe)),
            5_000
        );

        await a.send('/topic/chat', { event: 'chat', data: 'hello stomp' });

        // The scheduler's chat-tick (every 2s) and the sync probe may interleave
        // with our message — match by the exact payload, not position.
        const isHello = (body: string): boolean => (JSON.parse(body) as { data: string }).data === 'hello stomp';
        await waitFor(() => fromA.bodies.some(isHello), 5_000);
        await waitFor(() => fromB.bodies.some(isHello), 5_000);
        const expected = { event: 'chat', data: 'hello stomp' };
        expect(JSON.parse(fromA.bodies.find(isHello) as string)).toEqual(expected);
        expect(JSON.parse(fromB.bodies.find(isHello) as string)).toEqual(expected);
        a.disconnect();
        b.disconnect();
    });

    test('receipts resolve only after the broker acknowledges the SEND', async () => {
        const c = stomp();
        await waitFor(() => c.connected.value, 5_000);
        const sub = c.subscribe('/topic/chat', { id: 'spec-c' });
        const received = collect(sub);
        const sendReceipt = c.send('/topic/chat', { event: 'chat', data: 'receipted' });
        await sendReceipt; // resolves on the broker's RECEIPT frame
        await waitFor(() => received.bodies.length >= 1, 5_000);
        expect(JSON.parse(received.bodies[0] as string)).toEqual({ event: 'chat', data: 'receipted' });
        c.disconnect();
    });

    test('the scheduler pushes a periodic chat-tick into the destination', async () => {
        const d = stomp();
        await waitFor(() => d.connected.value, 5_000);
        const sub = d.subscribe('/topic/chat', { id: 'spec-d' });
        const received = collect(sub);
        await waitFor(
            () => received.bodies.some((body) => (JSON.parse(body) as { event: string }).event === 'chat-tick'),
            10_000
        );
        const tick = JSON.parse(
            received.bodies.find((body) => (JSON.parse(body) as { event: string }).event === 'chat-tick') as string
        ) as {
            event: string;
            at: number;
        };
        expect(tick.event).toBe('chat-tick');
        expect(tick.at).toBeGreaterThan(0);
        d.disconnect();
    });

    test('deliberate disconnect sends DISCONNECT and closes the socket', async () => {
        const e = stomp();
        await waitFor(() => e.connected.value, 5_000);
        const ended: Array<void> = [];
        void (async () => {
            for await (const _ of e.closed) {
                // drain
            }
            ended.push(undefined);
        })();
        e.disconnect();
        await waitFor(() => ended.length === 1, 5_000);
    });

    test('a queue subscription replays the backlog (AD-23 D11)', async () => {
        const client = stomp();
        await waitFor(() => client.connected.value, 5_000);
        // The seeder client both seeds and consumes the live message; the
        // broker stores the SEND in the /queue backlog (D11).
        const seeder = client.subscribe('/queue/seeds', { id: 'seed' });
        const seeded = collect(seeder);
        await client.send('/queue/seeds', { event: 'seed', n: 1 });
        await waitFor(() => seeded.bodies.length >= 1, 5_000);
        seeder.unsubscribe();
        client.disconnect();

        const late = stomp();
        await waitFor(() => late.connected.value, 5_000);
        const sub = late.subscribe('/queue/seeds', { id: 'late' });
        const received = collect(sub);
        await waitFor(() => received.bodies.length >= 1, 5_000);
        const seed = JSON.parse(received.bodies[0] as string) as { event: string; n: number };
        expect(seed).toEqual({ event: 'seed', n: 1 });
        late.disconnect();
    });

    test('binary bodies round-trip byte-exact through the client (AD-23 D8)', async () => {
        const client = stomp();
        await waitFor(() => client.connected.value, 5_000);
        const sub = client.subscribe('/topic/bin', { id: 'bin' });
        const received: Array<unknown> = [];
        void (async () => {
            for await (const message of sub.messages) {
                received.push(message);
            }
        })();
        const body = new Uint8Array([0, 255, 1, 0]);
        await client.send('/topic/bin', body);
        await waitFor(() => received.length >= 1, 5_000);
        expect((received[0] as { body: string | Uint8Array }).body).toEqual(body);
        client.disconnect();
    });
});
