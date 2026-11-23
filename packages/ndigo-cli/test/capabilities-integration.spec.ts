// @vitest-environment node
/**
 * Capability apply against a real fixture app: workspace packages linked by
 * path, the generated stdio server answering MCP, and `ndigo inspect`.
 */
import { spawn } from 'node:child_process';
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { CallToolResultSchema } from '@modelcontextprotocol/sdk/types.js';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const PACKAGE_DIR = resolve(TEST_DIR, '..');
const ROOT = resolve(PACKAGE_DIR, '..', '..');
const BIN = join(PACKAGE_DIR, 'bin', 'run.js');
const TSX = join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const FIXTURE = join(TEST_DIR, 'fixtures', 'capability-app');

/** Packages the fixture declares, resolved to the workspace tree by `link:`. */
const LINKED = ['boot', 'context', 'dispatcher', 'inspect', 'mcp', 'platform-node', 'ai', 'ai-sdk'];

let app: string;

interface Result {
    readonly code: number;
    readonly out: string;
    readonly err: string;
}

function capture(proc: ReturnType<typeof spawn>): Promise<Result> {
    const out: string[] = [];
    const err: string[] = [];
    if (proc.stdout !== null) {
        void (async () => {
            for await (const chunk of proc.stdout) out.push(String(chunk));
        })().catch(() => undefined);
    }
    if (proc.stderr !== null) {
        void (async () => {
            for await (const chunk of proc.stderr) err.push(String(chunk));
        })().catch(() => undefined);
    }
    return new Promise<number>((resolveCode) => {
        proc.once('close', resolveCode);
    }).then((code) => ({ code, out: out.join(''), err: err.join('') }));
}

function runCli(args: string[]): Promise<Result> {
    return capture(spawn(process.execPath, [BIN, ...args], { cwd: app, stdio: ['ignore', 'pipe', 'pipe'] }));
}

function runTsx(file: string): Promise<Result> {
    return capture(spawn(process.execPath, [TSX, file], { cwd: app, stdio: ['ignore', 'pipe', 'pipe'] }));
}

function linkPackage(name: string, target: string): void {
    const link = join(app, 'node_modules', name);
    mkdirSync(dirname(link), { recursive: true });
    symlinkSync(target, link, 'dir');
}

beforeAll(() => {
    app = mkdtempSync(join(tmpdir(), 'ndigo-capability-app-'));
    cpSync(FIXTURE, app, { recursive: true });

    const dependencies: Record<string, string> = {};
    for (const name of LINKED) {
        const target = join(ROOT, 'packages', `ndigo-${name}`);
        dependencies[`@ndigo/${name}`] = `link:${target}`;
        linkPackage(`@ndigo/${name}`, target);
    }
    const polyfill = join(ROOT, 'node_modules', '@tsmetadata', 'polyfill');
    dependencies['@tsmetadata/polyfill'] = `link:${polyfill}`;
    linkPackage('@tsmetadata/polyfill', polyfill);

    writeFileSync(
        join(app, 'package.json'),
        `${JSON.stringify(
            {
                name: 'capability-fixture',
                private: true,
                type: 'module',
                scripts: { inspect: 'tsx src/inspect.ts' },
                dependencies,
            },
            null,
            2
        )}\n`
    );
});

afterAll(() => {
    rmSync(app, { recursive: true, force: true });
});

describe('capability apply (fixture app)', () => {
    it('applies agent-surface and agent-model, then reports nothing to do', async () => {
        const surface = await runCli([
            'add',
            'agent-surface',
            '--apply',
            '--json',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
        ]);
        expect(surface.code).toBe(0);
        expect((JSON.parse(surface.out) as { applied: boolean }).applied).toBe(true);
        expect(readFileSync(join(app, 'src', 'mcp.ts'), 'utf8')).toContain("name: 'capability-fixture'");

        const model = await runCli(['add', 'agent-model', '--apply', '--json']);
        expect(model.code).toBe(0);
        expect((JSON.parse(model.out) as { applied: boolean }).applied).toBe(true);
        expect(readFileSync(join(app, 'src', 'ai-config.ts'), 'utf8')).toContain('class AiConfig');

        const again = await runCli([
            'add',
            'agent-surface',
            '--apply',
            '--json',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
        ]);
        expect(again.code).toBe(0);
        expect((JSON.parse(again.out) as { applied: boolean }).applied).toBe(false);
    });

    it('boots the fixture and answers the inspect script', async () => {
        const result = await runTsx('src/inspect.ts');
        expect(result.code).toBe(0);
        const manifest = JSON.parse(result.out) as {
            mappings: { pattern: string; handler: { class: string; method: string } }[];
        };
        expect(manifest.mappings).toContainEqual(
            expect.objectContaining({
                pattern: '/orders/:id',
                handler: expect.objectContaining({ class: 'FixtureTools', method: 'lookupOrder' }),
            })
        );
    });

    it('serves the generated stdio entry to an MCP client', async () => {
        const transport = new StdioClientTransport({
            command: process.execPath,
            args: [TSX, join(app, 'src', 'mcp.ts')],
            cwd: app,
            stderr: 'ignore',
        });
        const client = new Client({ name: 'capability-fixture', version: '1.0.0' });
        await client.connect(transport);
        try {
            const tools = (await client.listTools()).tools.map((tool) => tool.name);
            expect(tools).toContain('lookup_order');

            const result = CallToolResultSchema.parse(
                await client.callTool({ name: 'lookup_order', arguments: { id: 'a-1' } }, CallToolResultSchema)
            );
            const block = result.content.find((entry) => entry.type === 'text');
            expect(JSON.parse(block?.type === 'text' ? block.text : 'null')).toEqual({ id: 'a-1' });
        } finally {
            await client.close();
        }
    });

    it('verifies the capability against the running app', async () => {
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json']);
        expect(result.code).toBe(0);
        const report = JSON.parse(result.out) as {
            ok: boolean;
            checks: { id: string; status: string; message?: string }[];
        };
        expect(report.ok).toBe(true);
        expect(report.checks.find((check) => check.id === 'mcp-stdio:tools/list')?.status).toBe('pass');
        expect(report.checks.find((check) => check.id === 'route-parity:*')?.status).toBe('pass');
    });
});
