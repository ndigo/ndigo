// @vitest-environment node
/**
 * In-memory MCP client/server specs for `ndigo mcp`: the static tool set,
 * read-only gating, and the manifest/log/target/rule tools.
 */
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { createAppServer, startAppServer } from '../src/mcp/server.js';
import type { AppServerOptions } from '../src/mcp/server.js';

const MANIFEST = {
    version: 1,
    generatedAt: '2026-11-09T00:00:00.000Z',
    app: { name: 'fixture', profiles: ['test'] },
    routes: [{ name: 'greeting', path: '/greeting' }],
    mappings: [],
    config: [
        { key: 'server.port', type: 'number', hasValue: true },
        { key: 'secrets.key', type: 'string', hasValue: false },
    ],
};

const dirs: string[] = [];
let close: (() => Promise<void>) | undefined;

afterEach(async () => {
    await close?.();
    close = undefined;
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
    delete process.env['NDIGO_DOCS_DIR'];
});

function createApp(options: { inspect?: boolean; mcp?: boolean } = {}): string {
    const dir = mkdtempSync(join(tmpdir(), 'ndigo-mcp-'));
    dirs.push(dir);
    const scripts: Record<string, string> = {
        inspect: 'node inspect.mjs',
        build: 'node target.mjs',
        test: 'node target.mjs',
        lint: 'node target.mjs',
    };
    if (options.inspect === false) delete scripts['inspect'];
    if (options.mcp === true) {
        scripts['mcp'] = 'node silent.mjs';
        writeFileSync(join(dir, 'silent.mjs'), '');
    }
    writeFileSync(
        join(dir, 'package.json'),
        JSON.stringify({ name: 'fixture', type: 'module', private: true, scripts }, null, 2)
    );
    writeFileSync(join(dir, 'inspect.mjs'), `process.stdout.write(${JSON.stringify(JSON.stringify(MANIFEST))});\n`);
    writeFileSync(
        join(dir, 'target.mjs'),
        "process.stdout.write('target ran\\n');\nprocess.stderr.write('target noted\\n');\n"
    );
    mkdirSync(join(dir, 'logs'));
    writeFileSync(join(dir, 'logs', 'app.log'), 'one\ntwo\nthree\n');
    return dir;
}

async function connect(options: AppServerOptions): Promise<Client> {
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
    const server = createAppServer(options);
    const client = new Client({ name: 'ndigo-mcp-test', version: '1.0.0' });
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

function toolNames(client: Client): Promise<string[]> {
    return client.listTools().then((result) => result.tools.map((tool) => tool.name).sort());
}

describe('ndigo mcp', () => {
    it('lists the static tool set without get_commands', async () => {
        const client = await connect({ dir: createApp() });
        expect(await toolNames(client)).toEqual([
            'get_best_practices',
            'get_config_keys',
            'get_logs',
            'get_manifest',
            'get_routes',
            'record_rule',
            'run_doctor',
            'run_target',
        ]);
    });

    it('omits mutating tools in read-only mode', async () => {
        const client = await connect({ dir: createApp(), readOnly: true });
        const names = await toolNames(client);
        expect(names).toContain('get_manifest');
        expect(names).not.toContain('run_target');
        expect(names).not.toContain('record_rule');
    });

    it('answers get_manifest, get_routes, and get_config_keys', async () => {
        const client = await connect({ dir: createApp() });

        expect(await call(client, 'get_manifest', {})).toEqual(MANIFEST);
        expect(await call(client, 'get_routes', {})).toEqual({ routes: MANIFEST.routes });
        expect(await call(client, 'get_config_keys', {})).toEqual({ keys: MANIFEST.config });
    });

    it('reports a missing inspect script with the AD-70 hint', async () => {
        const client = await connect({ dir: createApp({ inspect: false }) });
        const message = await callError(client, 'get_manifest', {});
        expect(message).toContain('no "inspect" script');
        expect(message).toContain('(AD-70)');
    });

    it('tails the application log', async () => {
        const dir = createApp();
        const client = await connect({ dir });
        expect(await call(client, 'get_logs', { lines: 2 })).toEqual({
            file: join(dir, 'logs', 'app.log'),
            lines: 2,
            content: 'two\nthree\n',
        });
    });

    it('runs a target and captures both streams', async () => {
        const client = await connect({ dir: createApp() });
        expect(await call(client, 'run_target', { target: 'build' })).toEqual({
            target: 'build',
            exitCode: 0,
            stdout: 'target ran\n',
            stderr: 'target noted\n',
        });
    });

    it('records rules, refuses silent overwrites, and regenerates the index', async () => {
        const dir = createApp();
        const client = await connect({ dir });

        expect(await call(client, 'record_rule', { name: 'Prefer signals', rule: 'Use signals for state.' })).toEqual({
            path: join('.ndigo', 'rules', 'prefer-signals.md'),
            index: join('.ndigo', 'rules', 'INDEX.md'),
        });
        expect(readFileSync(join(dir, '.ndigo', 'rules', 'prefer-signals.md'), 'utf8')).toBe(
            '# Prefer signals\n\nUse signals for state.\n'
        );

        const refusal = await callError(client, 'record_rule', { name: 'Prefer signals', rule: 'Changed.' });
        expect(refusal).toContain('refusing to overwrite');

        await call(client, 'record_rule', { name: 'Route naming', rule: 'Name routes by resource.' });
        expect(readFileSync(join(dir, '.ndigo', 'rules', 'INDEX.md'), 'utf8')).toBe(
            '# Application rules\n\n- [Prefer signals](prefer-signals.md)\n- [Route naming](route-naming.md)\n'
        );

        await call(client, 'record_rule', { name: 'Prefer signals', rule: 'Changed.', replace: true });
        expect(readFileSync(join(dir, '.ndigo', 'rules', 'prefer-signals.md'), 'utf8')).toBe(
            '# Prefer signals\n\nChanged.\n'
        );
    });

    it('indexes best-practice sections and expands a matching topic', async () => {
        const dir = createApp();
        const docs = mkdtempSync(join(tmpdir(), 'ndigo-docs-'));
        dirs.push(docs);
        writeFileSync(
            join(docs, 'STYLE_GUIDE.md'),
            '# Style\n\n## Naming\n\nUse camelCase.\n\n## Modules\n\nOne per file.\n'
        );
        writeFileSync(join(docs, 'ARCHITECTURE.md'), '# Architecture\n\n## Worktrees\n\nOne per session.\n');
        process.env['NDIGO_DOCS_DIR'] = docs;
        const client = await connect({ dir });

        const index = (await call(client, 'get_best_practices', {})) as {
            sources: string[];
            sections: { title: string; content: string }[];
        };
        expect(index.sources).toEqual([join(docs, 'STYLE_GUIDE.md'), join(docs, 'ARCHITECTURE.md')]);
        expect(index.sections).toEqual([
            { title: 'Naming', content: '' },
            { title: 'Modules', content: '' },
            { title: 'Worktrees', content: '' },
        ]);

        const naming = (await call(client, 'get_best_practices', { topic: 'naming' })) as {
            sections: { title: string; content: string }[];
        };
        expect(naming.sections).toEqual([{ title: 'Naming', content: 'Use camelCase.' }]);
    });

    it('runs the diagnostics for the application directory', async () => {
        const dir = createApp();
        const client = await connect({ dir });
        const report = (await call(client, 'run_doctor', {})) as {
            ok: boolean;
            exitCode: number;
            rows: string[];
            failures: string[];
        };
        expect(report.rows).toContain(`cwd ${dir}`);
        expect(report.ok).toBe(report.failures.length === 0);
    });

    it('rejects live mode without an mcp script', async () => {
        await expect(startAppServer({ dir: createApp(), live: true })).rejects.toThrow(/no "mcp" script/u);
    });

    it('delegates live mode to the application mcp script', async () => {
        await startAppServer({ dir: createApp({ mcp: true }), live: true });
        expect(process.exitCode).toBe(0);
    });
});
