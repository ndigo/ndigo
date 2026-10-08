/**
 * `/loggers` endpoint specs (AD-76 D-7).
 * @module blue-management
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { MetadataConfigApplicationContext } from '@blue/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@blue/platform-node';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';

const LEVEL = 'mgmt-spec.logger';

class ExposedManagement extends ManagementAutoConfiguration {
    constructor() {
        super({ exposure: { include: ['*'] } });
    }
}

describe('LoggersController (AD-76 D-7)', () => {
    let base: string;
    let adapter: NodeHTTPServerAdapter;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('loggers-endpoint');
        context.register(NodeAutoConfiguration);
        context.register(ExposedManagement);
        context.refresh();
        const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
        adapter = new NodeHTTPServerAdapter(dispatcher);
        await adapter.listen(0, '127.0.0.1');
        const server = adapter.server;
        if (
            typeof server !== 'object' ||
            server === null ||
            !('address' in server) ||
            typeof server.address !== 'function'
        ) {
            throw new Error('Expected the adapter to expose a bound Node server');
        }
        const address = server.address() as { port: number };
        base = `http://127.0.0.1:${address.port}`;
    });
    afterAll(async () => await adapter.close());

    test('the index carries the canonical levels and a deterministic logger map', async () => {
        const res = await fetch(`${base}/loggers`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { levels: string[]; loggers: Record<string, { effectiveLevel: string }> };
        expect(body.levels).toEqual(['debug', 'error', 'fatal', 'info', 'off', 'trace', 'warn']);
        // Deterministic: the logger map keys are sorted.
        const keys = Object.keys(body.loggers);
        expect(keys).toEqual(keys.toSorted());
    });

    test('an unknown logger answers 404', async () => {
        expect((await fetch(`${base}/loggers/mgmt-spec.never`)).status).toBe(404);
    });

    test('POST sets a level; GET reflects it; {} clears it', async () => {
        const set = await fetch(`${base}/loggers/${LEVEL}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ configuredLevel: 'warn' }),
        });
        expect(set.status).toBe(200);
        const afterSet = (await set.json()) as { configuredLevel: string; effectiveLevel: string };
        expect(afterSet.configuredLevel).toBe('warn');
        expect(afterSet.effectiveLevel).toBe('warn');

        const get = (await (await fetch(`${base}/loggers/${LEVEL}`)).json()) as {
            configuredLevel?: string;
            effectiveLevel: string;
        };
        expect(get.configuredLevel).toBe('warn');

        const clear = await fetch(`${base}/loggers/${LEVEL}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({}),
        });
        expect(clear.status).toBe(200);
        const afterClear = (await clear.json()) as { configuredLevel?: string; effectiveLevel: string };
        expect(afterClear.configuredLevel).toBeUndefined();
        expect(afterClear.effectiveLevel).toBe('debug');
    });

    test('an invalid level name is rejected by the body schema', async () => {
        const res = await fetch(`${base}/loggers/${LEVEL}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ configuredLevel: 'loud' }),
        });
        // The dispatcher's validatedBody convention (422), not Spring's 400.
        expect(res.status).toBe(422);
    });
});
