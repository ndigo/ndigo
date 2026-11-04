/**
 * `/env` endpoint specs (AD-76 D-3).
 * @module ndigo-management
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { ApplicationBuilder } from '@ndigo/boot';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import type { JSONObject, JSONValue } from '@ndigo/core';

const CIPHER_MARKER = '{cipher:v1:AAAA}';

class ExposedManagement extends ManagementAutoConfiguration {
    constructor() {
        super({ exposure: { include: ['*'] } });
    }
}

async function bootWith(management: typeof ManagementAutoConfiguration, properties: JSONObject = {}) {
    const context = await new ApplicationBuilder([NodeAutoConfiguration, management]).properties(properties).run();
    const dispatcher = context.getValue<NodeDispatcher>('dispatcher');
    const adapter = new NodeHTTPServerAdapter(dispatcher);
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
    return { adapter, base: `http://127.0.0.1:${address.port}` };
}

const APP_PROPERTIES: Record<string, JSONValue> = {
    server: { port: 8080, name: 'env-demo' },
    api: { secretToken: CIPHER_MARKER },
};

interface EnvDocument {
    activeProfiles: string[];
    propertySources: Array<{
        name: string;
        properties: Record<string, { value?: string; origin: string }>;
    }>;
}

describe('EnvironmentController (AD-76 D-3)', () => {
    test('values are redacted by default; origins and keys remain', async () => {
        const { adapter, base } = await bootWith(ExposedManagement, { ...APP_PROPERTIES });
        try {
            const res = await fetch(`${base}/env`);
            expect(res.status).toBe(200);
            const body = (await res.json()) as EnvDocument;
            // The builder properties ride the `boot` source; find by content.
            const app = body.propertySources.find((source) => 'server.port' in source.properties);
            expect(app).toBeDefined();
            const origin = app?.name;
            expect(app?.properties['server.port']).toEqual({ value: '<redacted>', origin });
            expect(app?.properties['api.secretToken']).toEqual({ value: '<redacted>', origin });
            expect(app?.properties['server.name']).toEqual({ value: '<redacted>', origin });
        } finally {
            await adapter.close();
        }
    });

    test('showValues: true emits the raw stored text but never decrypted plaintext', async () => {
        const { adapter, base } = await bootWith(ExposedManagement, {
            ...APP_PROPERTIES,
            management: { endpoints: { env: { showValues: true } } },
        });
        try {
            const body = (await (await fetch(`${base}/env`)).json()) as EnvDocument;
            const app = body.propertySources.find((source) => 'server.port' in source.properties);
            expect(app).toBeDefined();
            expect(app?.properties['server.name']?.value).toBe('env-demo');
            expect(app?.properties['server.port']?.value).toBe('8080');
            // The cipher marker is shown as the stored marker text — the
            // endpoint never resolves or decrypts (SEC-A).
            expect(app?.properties['api.secretToken']?.value).toBe(CIPHER_MARKER);
        } finally {
            await adapter.close();
        }
    });

    test('?toMatch= filters to matching sources and property prefixes', async () => {
        const { adapter, base } = await bootWith(ExposedManagement, { ...APP_PROPERTIES });
        try {
            const body = (await (await fetch(`${base}/env?toMatch=server`)).json()) as EnvDocument;
            for (const source of body.propertySources) {
                for (const key of Object.keys(source.properties)) {
                    expect(
                        key.startsWith('server') || source.name.includes('server'),
                        `key "${key}" in source "${source.name}" must match toMatch=server`
                    ).toBe(true);
                }
            }
            const app = body.propertySources.find((source) => 'server.port' in source.properties);
            expect(Object.keys(app?.properties ?? {}).sort()).toEqual(['server.name', 'server.port']);
            expect(app?.properties['api.secretToken']).toBeUndefined();
        } finally {
            await adapter.close();
        }
    });
});
