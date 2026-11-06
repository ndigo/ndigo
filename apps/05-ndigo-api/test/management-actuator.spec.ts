/**
 * AD-76 demo gate: the ndigo-api actuator surface served through the real
 * bootstrap path (the same `ApplicationBuilder` assembly `src/index.ts`
 * runs, with the app's own property sources).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { ManagementConfiguration } from '../src/management-configuration';
import { NodeAppConfiguration } from '../src/node-app-configuration';

const LOGGER_NAME = 'ndigo-api.spec.logger';

describe('actuator parity demo (AD-76)', () => {
    let base: string;
    let adapter: NodeHTTPServerAdapter;

    beforeAll(async () => {
        const context = await new ApplicationBuilder([
            NodeAutoConfiguration,
            ManagementConfiguration,
            NodeAppConfiguration,
        ])
            .properties({
                server: { name: 'ndigo-api-spec', port: 0 },
                api: { secretToken: '{cipher:v1:AAAA}' },
            })
            .run();
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

    afterAll(async () => {
        await adapter.close();
    });

    test('GET /health serves the aggregate with the telemetry component', async () => {
        const res = await fetch(`${base}/health`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { status: string; components: Record<string, { status: string }> };
        expect(body.status).toBe('UP');
        expect(body.components['telemetry']).toBeDefined();
    });

    test('GET /loggers serves the levels index', async () => {
        const res = await fetch(`${base}/loggers`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as { levels: string[]; loggers: Record<string, unknown> };
        expect(body.levels).toContain('debug');
        expect(body.loggers).toBeDefined();
    });

    test('POST /loggers sets a level and GET reflects it', async () => {
        const set = await fetch(`${base}/loggers/${LOGGER_NAME}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ configuredLevel: 'warn' }),
        });
        expect(set.status).toBe(200);
        expect((await set.json()) as { configuredLevel: string }).toMatchObject({ configuredLevel: 'warn' });
        const get = await fetch(`${base}/loggers/${LOGGER_NAME}`);
        expect((await get.json()) as { effectiveLevel: string }).toMatchObject({ effectiveLevel: 'warn' });
        // Invalid level names are rejected by the body schema (422).
        const bad = await fetch(`${base}/loggers/${LOGGER_NAME}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ configuredLevel: 'loud' }),
        });
        expect(bad.status).toBe(422);
    });

    test('GET /env serves sources with redacted values by default', async () => {
        const res = await fetch(`${base}/env`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
            activeProfiles: string[];
            propertySources: Array<{ name: string; properties: Record<string, { value?: string }> }>;
        };
        expect(Array.isArray(body.activeProfiles)).toBe(true);
        const app = body.propertySources.find((source) => source.name === 'boot');
        expect(app).toBeDefined();
        const origin = app?.name;
        expect(app?.properties['server.name']).toEqual({ value: '<redacted>', origin });
        expect(app?.properties['api.secretToken']).toEqual({ value: '<redacted>', origin });
    });

    test('GET /configprops enumerates the demo config classes — keys and types, never values', async () => {
        const res = await fetch(`${base}/configprops`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
            beans: Array<{ name: string; properties: Array<{ key: string; type?: string }> }>;
        };
        const names = body.beans.map((bean) => bean.name);
        expect(names).toEqual(expect.arrayContaining(['server', 'api']));
        for (const bean of body.beans) {
            for (const property of bean.properties) {
                // Every entry is `{ key, type? }` — a value can never ride here.
                expect(Object.keys(property).sort()).toEqual(property.type ? ['key', 'type'] : ['key']);
            }
        }
        // The secrets class's key is present (declaration), its value never is.
        const apiBean = body.beans.find((bean) => bean.name === 'api');
        expect(apiBean?.properties.map((property) => property.key)).toContain('api.secretToken');
    });
});
