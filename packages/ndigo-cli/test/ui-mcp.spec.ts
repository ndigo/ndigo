// @vitest-environment node
/**
 * In-memory MCP client/server specs for `ndigo ui mcp`.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createRegistryServer } from '../src/ui/mcp-server.js';
import type { RegistryServerOptions } from '../src/ui/mcp-server.js';
import { createRegistryFixture } from './_ui-registry-fixture.js';

let cleanup: (() => void) | undefined;
let close: (() => Promise<void>) | undefined;

afterEach(async () => {
    await close?.();
    close = undefined;
    cleanup?.();
    cleanup = undefined;
});

async function connect(options: RegistryServerOptions): Promise<Client> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createRegistryServer(options);
    const client = new Client({ name: 'ndigo-ui-mcp-test', version: '1.0.0' });
    await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
    close = async () => {
        await client.close();
        await server.close();
    };
    return client;
}

function textOf(result: CallToolResult): string {
    const block = result.content.find((entry) => entry.type === 'text');
    return block?.type === 'text' ? block.text : '';
}

async function call(client: Client, name: string, args: Record<string, unknown>): Promise<unknown> {
    const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }, CallToolResultSchema));
    const text = textOf(result);
    if (result.isError === true) throw new Error(text);
    return JSON.parse(text) as unknown;
}

async function callError(client: Client, name: string, args: Record<string, unknown>): Promise<string> {
    const result = CallToolResultSchema.parse(await client.callTool({ name, arguments: args }, CallToolResultSchema));
    if (result.isError !== true) throw new Error(`expected ${name} to fail`);
    return textOf(result);
}

describe('ndigo ui mcp', () => {
    it('lists and searches the registry', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        const listed = (await call(client, 'list_items', {})) as { count: number; items: { name: string }[] };
        expect(listed.count).toBe(2);
        expect(listed.items.map((item) => item.name)).toEqual(['dialog', 'lib']);

        const filtered = (await call(client, 'list_items', { type: 'registry:ui' })) as {
            items: { name: string }[];
        };
        expect(filtered.items.map((item) => item.name)).toEqual(['dialog']);

        const searched = (await call(client, 'search_items', { query: 'dialog' })) as {
            results: { name: string }[];
        };
        expect(searched.results[0]?.name).toBe('dialog');
    });

    it('returns one item with its README', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        writeFileSync(join(fixture.root, 'pkg', 'files', 'README.md'), '# Dialog\n\nA modal.\n');
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        const result = (await call(client, 'get_item', { name: 'dialog' })) as {
            item: { name: string; files: { target?: string }[] };
            readme?: string;
        };

        expect(result.item.name).toBe('dialog');
        expect(result.item.files[0]?.target).toBe('@ui/dialog.ts');
        expect(result.readme).toContain('A modal.');
    });

    it('dry-runs installs by default and writes only on request', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        const dry = (await call(client, 'install_items', { items: ['dialog'], skipInstall: true })) as {
            dryRun: boolean;
            written: string[];
        };
        expect(dry.dryRun).toBe(true);
        expect(dry.written).toContain('src/ui/dialog.ts');
        expect(existsSync(join(fixture.app, 'src/ui/dialog.ts'))).toBe(false);

        const applied = (await call(client, 'install_items', {
            items: ['dialog'],
            dryRun: false,
            skipInstall: true,
        })) as { dryRun: boolean; written: string[] };
        expect(applied.dryRun).toBe(false);
        expect(existsSync(join(fixture.app, 'src/lib/base.ts'))).toBe(true);
        expect(existsSync(join(fixture.app, 'src/ui/dialog.ts'))).toBe(true);
        const lock = JSON.parse(readFileSync(join(fixture.app, 'ui.lock.json'), 'utf8')) as {
            items: Record<string, unknown>;
        };
        expect(Object.keys(lock.items).sort()).toEqual(['dialog', 'lib']);
    });

    it('validates a registry and reports missing files', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        const valid = (await call(client, 'validate_registry', {})) as { valid: boolean; items: number };
        expect(valid).toMatchObject({ valid: true, items: 2 });

        unlinkSync(join(fixture.root, 'pkg', 'files', 'dialog.ts'));
        const invalid = (await call(client, 'validate_registry', {})) as { valid: boolean; errors: string[] };
        expect(invalid.valid).toBe(false);
        expect(invalid.errors.some((message) => message.includes('does not exist'))).toBe(true);
    });

    it('returns the catalog for installed items only', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        await call(client, 'install_items', { items: ['dialog'], dryRun: false, skipInstall: true });
        const result = (await call(client, 'get_catalog', {})) as {
            catalog: {
                catalogId: string;
                components: Record<string, { 'x-ndigo-item': string; 'x-ndigo-element'?: string }>;
            };
        };

        expect(result.catalog.catalogId).toBe('ndigo-ui');
        expect(Object.keys(result.catalog.components)).toEqual(['Dialog']);
        expect(result.catalog.components.Dialog?.['x-ndigo-item']).toBe('dialog');
        expect(result.catalog.components.Dialog?.['x-ndigo-element']).toBe('nd-dialog');
    });

    it('omits the install tool in read-only mode', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry, readOnly: true });

        const tools = (await client.listTools()).tools.map((tool) => tool.name);
        expect(tools).toEqual(['list_items', 'search_items', 'get_item', 'validate_registry', 'get_catalog']);
    });

    it('returns tool errors instead of throwing', async () => {
        const fixture = createRegistryFixture();
        cleanup = fixture.cleanup;
        const client = await connect({ dir: fixture.app, registry: fixture.registry });

        const message = await callError(client, 'install_items', { items: ['missing-item'], skipInstall: true });
        expect(message).toContain("unknown registry item 'missing-item'");
    });
});
