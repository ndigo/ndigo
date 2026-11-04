/**
 * Live lane: two **real** application stacks in one process, both pointed at
 * the same standalone Redis (`NDIGO_REDIS_TEST_URL`), asserting the two promises
 * the demo exists to make — a cache entry written by node A is served (and
 * counted) by node B, and a message published on node A reaches the sockets
 * connected to node B.
 *
 * Gated exactly like the `@ndigo/redis` live suites: the whole group is skipped
 * unless `NDIGO_REDIS_TEST_URL` points at a running standalone server (7.2+).
 * A skipped group is not integration proof — this lane must not be read as
 * evidence that the Redis path works when it did not run.
 *
 * The lane uses a unique namespace per run and 60-second entry TTLs, so it
 * leaves no state behind and needs no teardown beyond closing its own clients.
 * HTTP responses are parsed with Zod at this boundary, so a shape change fails
 * loudly instead of slipping through a cast.
 * @module ndigo-redis-fanout
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { randomUUID } from 'node:crypto';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import type { ApplicationContext } from '@ndigo/context';
import { ManagementAutoConfiguration } from '@ndigo/management';
import { HTTP_SERVER, NodeAutoConfiguration } from '@ndigo/platform-node';
import { WebSocketClient } from '@ndigo/socket';
import { BOARD_PATH } from '../src/board-message';
import { FANOUT_BACKEND, type FanoutBackend } from '../src/fanout-backend';
import { RedisFanoutConfiguration } from '../src/redis-fanout-configuration';
import { collectMessages, waitForMessage, waitForOpen, type CollectedMessages } from './socket-client-helpers';
import { BoardMessageDoc, BoardPostDoc, CacheDoc, HealthDoc } from './wire-schemas';

const url = process.env['NDIGO_REDIS_TEST_URL'];
// Live integration lane — intentionally skipped unless NDIGO_REDIS_TEST_URL points
// at a running standalone Redis (see the file header); the memory lanes cover the rest.
const live = url === undefined ? describe.skip : describe;

/** How long a lane waits for a message before failing (generous: CI machines). */
const TIMEOUT_MS = 10_000;

/** One booted app stack: its own instance id, context, backend, and port. */
interface LiveNode {
    readonly id: string;
    readonly context: ApplicationContext;
    readonly backend: FanoutBackend;
    readonly origin: string;
}

/** A joined board client: the connection and its drained message stream. */
interface Joined {
    readonly client: WebSocketClient;
    readonly collected: CollectedMessages;
}

live('redis-fanout across two nodes on one Redis', () => {
    const nodes: LiveNode[] = [];
    const clients: WebSocketClient[] = [];
    /** The two nodes under test; assigned by `beforeAll`. */
    let a!: LiveNode;
    let b!: LiveNode;
    /** The variables this lane overrides, captured for exact restoration. */
    const savedEnv: Record<string, string | undefined> = {
        NDIGO_REDIS_URL: process.env['NDIGO_REDIS_URL'],
        NDIGO_REDIS_NAMESPACE: process.env['NDIGO_REDIS_NAMESPACE'],
        NDIGO_INSTANCE_ID: process.env['NDIGO_INSTANCE_ID'],
        PORT: process.env['PORT'],
    };

    /**
     * Boots one full node: the app's own composition root, told apart from its
     * sibling by instance id, on an ephemeral port.
     *
     * @param id - The instance id to boot as.
     * @returns The booted node.
     */
    async function bootNode(id: string): Promise<LiveNode> {
        process.env['NDIGO_INSTANCE_ID'] = id;
        process.env['PORT'] = '0'; // ephemeral port, so both nodes coexist
        const context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementAutoConfiguration,
            RedisFanoutConfiguration,
        ]).run();
        const backend = context.getValue(FANOUT_BACKEND);
        await backend.connect();
        const server = context.getValue(HTTP_SERVER);
        await server.start();
        // `HTTPServer.server` is the adapter's server, `unknown` on the shared contract.
        const bound = server.server as { address: () => { port: number } | null };
        const node: LiveNode = { id, context, backend, origin: `127.0.0.1:${bound.address()?.port}` };
        nodes.push(node);
        return node;
    }

    /**
     * Connects a client to a node's board and proves it joined: a room echo of
     * the client's own first message can only arrive once the handler ran
     * `session.join`, which removes any race between connecting and posting.
     *
     * @param node - The node to connect to.
     * @param ready - Probe text; its echo is awaited before returning.
     * @returns The connection and its drained stream.
     */
    async function connectJoined(node: LiveNode, ready: string): Promise<Joined> {
        const client = new WebSocketClient(`ws://${node.origin}${BOARD_PATH}`, { reconnect: null });
        clients.push(client);
        await waitForOpen(client, TIMEOUT_MS);
        const collected = collectMessages(client);
        client.send(ready);
        await waitForMessage(collected, (m) => m['text'] === ready && m['event'] === 'board-message', TIMEOUT_MS);
        return { client, collected };
    }

    /**
     * Posts to a node's scripted route and asserts the `202`.
     *
     * @param node - The node accepting the request.
     * @param text - The board text.
     * @returns The parsed `202` document.
     */
    async function post(node: LiveNode, text: string) {
        const res = await fetch(`http://${node.origin}/board`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ text }),
        });
        expect(res.status).toBe(202);
        return BoardPostDoc.parse(await res.json());
    }

    /**
     * Reads one node's cache entry.
     *
     * @param node - The node to read from.
     * @param path - The cache path (key plus optional seed query).
     * @returns The parsed entry document.
     */
    async function readCache(node: LiveNode, path: string) {
        const res = await fetch(`http://${node.origin}/cache/${path}`);
        expect(res.status).toBe(200);
        return CacheDoc.parse(await res.json());
    }

    beforeAll(async () => {
        process.env['NDIGO_REDIS_URL'] = url;
        // Unique per run: no cross-run interference, and no teardown needed
        // (entries expire after the demo TTL, channels go with the namespace).
        process.env['NDIGO_REDIS_NAMESPACE'] = `ndigo-redis-fanout.test.${randomUUID().replace(/-/g, '').slice(0, 10)}`;
        a = await bootNode('node-a');
        b = await bootNode('node-b');
    }, 30_000);

    afterAll(async () => {
        for (const client of clients) {
            client.close(1000, 'spec done');
        }
        for (const node of nodes.splice(0)) {
            // oxlint-disable-next-line no-await-in-loop -- per-node teardown is ordered: the server stops before the resources it publishes through
            await node.context.getValue(HTTP_SERVER).close();
            // oxlint-disable-next-line no-await-in-loop -- the backend closes only after the server that publishes through it
            await node.backend.close();
            node.context.close();
        }
        for (const [name, value] of Object.entries(savedEnv)) {
            if (value === undefined) {
                delete process.env[name];
            } else {
                process.env[name] = value;
            }
        }
    });

    test('both nodes boot on the shared backend and report it over /health', async () => {
        // Independent requests: run them concurrently, then assert per node.
        await Promise.all(
            nodes.map(async (node) => {
                const res = await fetch(`http://${node.origin}/health`);
                expect(res.status).toBe(200);
                const health = HealthDoc.parse(await res.json());
                expect(health.components['redis-fanout-backend']?.details).toMatchObject({
                    mode: 'redis',
                    connected: true,
                    instanceId: node.id,
                });
            })
        );
    });

    test('a cache entry written by node A is read and counted by node B', async () => {
        const first = await readCache(a, 'shared?value=written-by-a');
        expect(first).toMatchObject({
            value: 'written-by-a',
            hits: 1,
            producer: 'node-a',
            servedBy: 'node-a',
            mode: 'redis',
        });

        // Shared state: node B sees node A's value, node A's producer marker,
        // and the counter both instances have driven up.
        const second = await readCache(b, 'shared');
        expect(second).toMatchObject({
            value: 'written-by-a',
            hits: 2,
            producer: 'node-a',
            servedBy: 'node-b',
            mode: 'redis',
        });
    });

    test('a message posted on node A reaches a socket connected to node B', async () => {
        const onB = await connectJoined(b, 'b-ready');
        const before = onB.collected.messages.length;

        const doc = await post(a, 'cross-node from a');

        expect(doc.posted.from).toBe('node-a');
        // The punchline: node A had nobody connected, yet the message arrived.
        expect(doc.localClients).toBe(0);
        const received = BoardMessageDoc.parse(
            await waitForMessage(onB.collected, (m) => m['text'] === 'cross-node from a', TIMEOUT_MS)
        );
        expect(received).toMatchObject({ event: 'board-message', from: 'node-a' });
        expect(onB.collected.messages.length).toBeGreaterThan(before);
    });

    test('a socket message on node B reaches a socket connected to node A', async () => {
        const onA = await connectJoined(a, 'a-ready');
        const onB = await connectJoined(b, 'b-ready-2');

        onB.client.send('cross-node from b');

        const atA = BoardMessageDoc.parse(
            await waitForMessage(onA.collected, (m) => m['text'] === 'cross-node from b', TIMEOUT_MS)
        );
        const atB = BoardMessageDoc.parse(
            await waitForMessage(onB.collected, (m) => m['text'] === 'cross-node from b', TIMEOUT_MS)
        );
        expect(atA).toMatchObject({ from: 'node-b' });
        expect(atB).toEqual(atA);
    });
});
