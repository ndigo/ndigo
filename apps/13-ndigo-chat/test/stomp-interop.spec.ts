/**
 * The interop oracle: a **third-party** STOMP client (`@stomp/stompjs`) against
 * the platform's broker at `/stomp/chat`.
 *
 * Verifies connect → subscribe (with a receipt) → send → receive, a receipted
 * SEND, and cross-client fan-out on `/topic/chat`. The endpoint carries no auth
 * wiring, so the client stands up standalone.
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { HTTP_SERVER, NodeAutoConfiguration, type HTTPServer } from '@ndigo/platform-node';
import { Client } from '@stomp/stompjs';
import { ChatConfiguration } from '../src/chat-configuration';
import { CHAT_DESTINATION } from '../src/stomp-chat-controller';

/** A connected `@stomp/stompjs` client plus its teardown. */
interface StompPeer {
    readonly client: Client;
    deactivate(): Promise<void>;
}

/**
 * Activates a stompjs client and resolves once CONNECTED.
 *
 * @param url - The broker's WebSocket URL.
 * @returns The connected peer.
 */
async function stompConnect(url: string): Promise<StompPeer> {
    const client = new Client({
        brokerURL: url,
        // STOMP 1.2 requires `host` on CONNECT; the broker enforces it.
        connectHeaders: { host: '127.0.0.1' },
        reconnectDelay: 0,
        heartbeatIncoming: 0,
        heartbeatOutgoing: 0,
        connectionTimeout: 5_000,
    });
    await new Promise<void>((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('STOMP CONNECT timed out')), 5_000);
        client.onConnect = () => {
            clearTimeout(timer);
            resolve();
        };
        client.onStompError = (frame) => {
            clearTimeout(timer);
            reject(new Error(`STOMP ERROR: ${frame.headers['message'] ?? 'unknown'}`));
        };
        client.onWebSocketError = () => {
            clearTimeout(timer);
            reject(new Error('STOMP WebSocket error'));
        };
        client.activate();
    });
    return {
        client,
        deactivate: () => client.deactivate({ force: true }).then(() => undefined),
    };
}

/**
 * Polls until `predicate` holds.
 *
 * @param predicate - The condition.
 * @param timeoutMs - Fail after this many milliseconds.
 */
async function waitFor(predicate: () => boolean, timeoutMs = 5_000): Promise<void> {
    const started = Date.now();
    while (!predicate()) {
        if (Date.now() - started > timeoutMs) {
            throw new Error('timed out waiting for STOMP condition');
        }
        // oxlint-disable-next-line no-await-in-loop -- each iteration re-reads the just-updated condition
        await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }
}

describe('ndigo-chat STOMP interop via @stomp/stompjs', () => {
    let context: Awaited<ReturnType<ApplicationBuilder['run']>>;
    let brokerUrl: string;
    const peers: StompPeer[] = [];

    beforeAll(async () => {
        process.env['PORT'] = '0';
        context = await new ApplicationBuilder([NodeAutoConfiguration, ChatConfiguration])
            .properties({ 'server.port': '0', 'server.name': 'stomp-spec' })
            .run();
        const server = context.getValue<HTTPServer>(HTTP_SERVER);
        await server.start();
        const bound = server.server as { address: () => { port: number } | null };
        brokerUrl = `ws://127.0.0.1:${bound.address()?.port}/stomp/chat`;
    }, 30_000);

    afterAll(async () => {
        for (const peer of peers) {
            // eslint-disable-next-line no-await-in-loop -- peers must deactivate one at a time so DISCONNECT frames drain deterministically.
            await peer.deactivate();
        }
        // Let any in-flight DISCONNECT teardown settle before the registry closes.
        await new Promise<void>((resolve) => setTimeout(resolve, 75));
        context.close();
        delete process.env['PORT'];
    });

    /** Connects a client and tracks it for teardown. */
    const connect = async (): Promise<StompPeer> => {
        const peer = await stompConnect(brokerUrl);
        peers.push(peer);
        return peer;
    };

    test('a third-party client subscribes, sends, and receives its own fan-out', async () => {
        const { client } = await connect();
        const received: string[] = [];

        // Subscribe is receipted: the RECEIPT proves the broker registered the
        // subscription, so the SEND below cannot race ahead of it.
        const subscribeReceipt = new Promise<void>((resolve) => client.watchForReceipt('sub-1', () => resolve()));
        client.subscribe(CHAT_DESTINATION, (message) => received.push(message.body), { receipt: 'sub-1' });
        await subscribeReceipt;

        client.publish({ destination: CHAT_DESTINATION, body: JSON.stringify({ event: 'chat', data: 'hello stomp' }) });
        await waitFor(() => received.length >= 1);
        expect(JSON.parse(received[0] as string)).toEqual({ event: 'chat', data: 'hello stomp' });
    });

    test('a receipted SEND resolves on the broker RECEIPT frame', async () => {
        const { client } = await connect();
        const receipt = new Promise<string>((resolve) =>
            client.watchForReceipt('send-1', (frame) => resolve(String(frame.headers['receipt-id'] ?? '')))
        );
        client.publish({
            destination: CHAT_DESTINATION,
            body: 'receipted',
            headers: { receipt: 'send-1' },
        });
        await expect(receipt).resolves.toBe('send-1');
    });

    test('a SEND fans out across two independent STOMP connections', async () => {
        const subscriber = await connect();
        const publisher = await connect();
        const received: string[] = [];
        subscriber.client.subscribe(CHAT_DESTINATION, (message) => received.push(message.body));

        publisher.client.publish({ destination: CHAT_DESTINATION, body: 'across connections' });
        await waitFor(() => received.includes('across connections'));
        expect(received).toContain('across connections');
    });
});
