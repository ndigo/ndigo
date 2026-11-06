/**
 * `/configprops` endpoint specs (AD-76 D-3).
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import { configurationProperties } from '@ndigo/boot';
import { MetadataConfigApplicationContext } from '@ndigo/context';
import { NodeAutoConfiguration, NodeDispatcher, NodeHTTPServerAdapter } from '@ndigo/platform-node';
import { ManagementAutoConfiguration } from '../src/management-auto-configuration';
import { z } from 'zod';

/** A schema-mode configuration class (the blueprint-reader path for types). */
@configurationProperties('demo', {
    schema: z.object({ host: z.string().default('h'), port: z.coerce.number().default(1) }),
})
class DemoConfig {
    host!: string;
    port!: number;
}

/** A prefix-less class — reported as `ROOT`. */
@configurationProperties(undefined, { schema: z.object({ flag: z.boolean().default(true) }) })
class RootConfig {
    flag!: boolean;
}

class ExposedManagement extends ManagementAutoConfiguration {
    constructor() {
        super({ exposure: { include: ['*'] }, configurationClasses: [DemoConfig, RootConfig] });
    }
}

describe('ConfigurationPropertiesController (AD-76 D-3)', () => {
    let base: string;
    let adapter: NodeHTTPServerAdapter;

    beforeAll(async () => {
        const context = new MetadataConfigApplicationContext('configprops-endpoint');
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

    test('enumerates declared keys with their conversion types, never values', async () => {
        const res = await fetch(`${base}/configprops`);
        expect(res.status).toBe(200);
        const body = (await res.json()) as {
            beans: Array<{ name: string; properties: Array<{ key: string; type?: string }> }>;
        };
        expect(body.beans).toEqual([
            {
                name: 'demo',
                properties: [
                    { key: 'demo.host', type: 'string' },
                    { key: 'demo.port', type: 'number' },
                ],
            },
            { name: 'ROOT', properties: [{ key: 'flag', type: 'boolean' }] },
        ]);
        // The wire contains keys and types only — no values by construction.
        expect(JSON.stringify(body)).not.toContain('"h"');
        expect(JSON.stringify(body)).not.toContain('8080');
    });
});
