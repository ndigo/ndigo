// @vitest-environment node
/**
 * `ndigo verify`: check selection, the JSON report, exit codes, and the
 * actionable failures for a broken MCP or OpenAPI surface.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

/** The compiled bin — the nx lane runs build:lib before test. */
const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');

const dirs: string[] = [];

afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

interface FixtureOptions {
    readonly tool?: string;
    readonly openapi?: boolean;
    readonly mcp?: boolean;
    readonly test?: boolean;
    readonly exitsAfterInitialize?: boolean;
    readonly floodsStdout?: boolean;
}

/** The manifest the fixture's inspect script prints. */
const FIXTURE_MANIFEST = {
    version: 1,
    generatedAt: '2026-01-01T00:00:00.000Z',
    app: { name: 'verify-fixture', profiles: [] },
    routes: [{ name: 'lookup', path: '/orders/{id}' }],
    mappings: [
        {
            pattern: '/orders/:id',
            httpMethods: ['GET'],
            tool: 'lookup_order',
            handler: { class: 'OrdersController', method: 'lookup' },
        },
    ],
    config: [],
};

function createApp(options: FixtureOptions = {}): string {
    const dir = mkdtempSync(join(tmpdir(), 'ndigo-verify-'));
    dirs.push(dir);
    const tool = options.tool ?? 'lookup_order';
    const scripts: Record<string, string> = {
        inspect: 'node inspect.mjs',
        typecheck: 'node ok.mjs',
    };
    if (options.mcp !== false) scripts['mcp'] = 'node mcp.mjs';
    if (options.openapi !== false) scripts['openapi'] = 'node openapi.mjs';
    if (options.test === true) scripts['test'] = 'node ok.mjs';
    writeFileSync(
        join(dir, 'package.json'),
        `${JSON.stringify({ name: 'verify-fixture', private: true, type: 'module', scripts }, null, 2)}\n`
    );
    writeFileSync(
        join(dir, 'inspect.mjs'),
        `process.stdout.write(${JSON.stringify(JSON.stringify(FIXTURE_MANIFEST))});\n`
    );
    writeFileSync(
        join(dir, 'openapi.mjs'),
        `process.stdout.write(${JSON.stringify(
            JSON.stringify({ openapi: '3.1.0', paths: { '/orders/{id}': { get: { operationId: 'getOrder' } } } })
        )});\n`
    );
    writeFileSync(
        join(dir, 'mcp.mjs'),
        `
import { createInterface } from 'node:readline';
const rl = createInterface({ input: process.stdin });
const send = (value) => process.stdout.write(JSON.stringify(value) + '\\n');
rl.on('line', (line) => {
    const message = JSON.parse(line);
    if (message.method === 'initialize') {
        send({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: '2024-11-05', capabilities: {}, serverInfo: { name: 'fixture', version: '1' } } });
    } else if (message.method === 'tools/list') {
        send({ jsonrpc: '2.0', id: message.id, result: { tools: [{ name: ${JSON.stringify(tool)}, inputSchema: { type: 'object' } }] } });
    }
});
`
    );
    if (options.exitsAfterInitialize === true) {
        // Answers initialize, then dies immediately: the "server boots,
        // answers, crashes" input `ndigo verify` must survive (issue #730).
        writeFileSync(
            join(dir, 'mcp.mjs'),
            `
import { createInterface } from 'node:readline';
const rl = createInterface({ input: process.stdin });
const send = (value) => process.stdout.write(JSON.stringify(value) + '\\n');
rl.on('line', (line) => {
    const message = JSON.parse(line);
    if (message.method === 'initialize') {
        send({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: '2024-11-05', capabilities: {}, serverInfo: { name: 'fixture', version: '1' } } });
        process.exit(0);
    }
});
`
        );
    }
    if (options.floodsStdout === true) {
        // Streams one unterminated line forever: the probe must cap its
        // buffer instead of growing it without bound until the timeout.
        writeFileSync(join(dir, 'mcp.mjs'), `setInterval(() => process.stdout.write('x'.repeat(8192)), 1);\n`);
    }
    writeFileSync(join(dir, 'ok.mjs'), 'process.exit(0);\n');
    mkdirSync(join(dir, 'logs'));
    return dir;
}

interface Result {
    readonly code: number;
    readonly out: string;
    readonly err: string;
}

function runCli(args: string[]): Promise<Result> {
    const proc = spawn(process.execPath, [BIN, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
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

interface Document {
    readonly ok: boolean;
    readonly capability?: string;
    readonly checks: { id: string; status: string; message?: string }[];
    readonly summary: { pass: number; fail: number; skip: number };
}

describe('ndigo verify', () => {
    it('runs the catalog checks and reports green', async () => {
        const dir = createApp();
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        expect(result.code).toBe(0);
        const report = JSON.parse(result.out) as Document;
        expect(report.ok).toBe(true);
        expect(report.capability).toBe('agent-surface');
        expect(report.checks.map((check) => check.id)).toEqual(['doctor', 'route-parity:*', 'mcp-stdio:tools/list']);
        expect(report.summary).toEqual({ pass: 3, fail: 0, skip: 0 });
    });

    it('fails parity when tools/list and the manifest disagree', async () => {
        const dir = createApp({ tool: 'other_tool' });
        const result = await runCli(['verify', '--capability', 'agent-surface', dir]);
        expect(result.code).toBe(1);
        expect(result.out).toContain("tool 'lookup_order' is missing from tools/list");
        expect(result.out).toContain("tool 'other_tool' has no @toolMapping in the manifest");
    });

    it('fails the MCP check when a named capability declares it but the script is absent', async () => {
        const dir = createApp({ mcp: false });
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        expect(result.code).toBe(1);
        const report = JSON.parse(result.out) as Document;
        expect(report.checks.find((check) => check.id === 'mcp-stdio:tools/list')).toMatchObject({
            status: 'fail',
            message: expect.stringContaining('no "mcp" script'),
        });
    });

    it('runs every lane with --full even when the capability declares none', async () => {
        const dir = createApp({ test: false });
        const result = await runCli(['verify', '--capability', 'agent-surface', '--full', '--json', dir]);
        expect(result.code).toBe(0);
        const report = JSON.parse(result.out) as Document;
        // `--full` means every lane: typecheck runs alongside test and lint,
        // even though agent-surface itself declares no typecheck.
        expect(report.checks.find((check) => check.id === 'typecheck')?.status).toBe('pass');
        // The fixture declares neither test nor lint, so both stay skips.
        expect(report.checks.find((check) => check.id === 'test')?.status).toBe('skip');
        const lint = report.checks.find((check) => check.id === 'lint');
        expect(lint?.status).toBe('skip');
        expect(report.summary.skip).toBeGreaterThanOrEqual(1);
    });

    it('prints the human report with pass and skip marks', async () => {
        const dir = createApp({ test: false });
        const result = await runCli(['verify', '--full', dir]);
        expect(result.code).toBe(0);
        expect(result.out).toContain('verify all capabilities');
        expect(result.out).toContain('✓ doctor');
        expect(result.out).toContain('- lint');
        expect(result.out).toContain('passed');
    });

    it('keeps the app manifest untouched', async () => {
        const dir = createApp();
        const before = readFileSync(join(dir, 'package.json'), 'utf8');
        await runCli(['verify', dir]);
        expect(readFileSync(join(dir, 'package.json'), 'utf8')).toBe(before);
    });

    it('fails cleanly when the mcp script exits right after initialize', async () => {
        const dir = createApp({ exitsAfterInitialize: true });
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        // A crashed server is a failed check, never a crashed CLI: the report
        // still parses and the remaining checks still ran (issue #730).
        expect(result.code).toBe(1);
        const report = JSON.parse(result.out) as Document;
        expect(report.checks.find((check) => check.id === 'mcp-stdio:tools/list')?.status).toBe('fail');
        expect(result.err).not.toContain('Unhandled');
    });

    it('keeps the report complete when a declared script is malformed', async () => {
        const dir = createApp();
        const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
            scripts: Record<string, string>;
        };
        manifest.scripts.inspect = 'node inspect.mjs\nnode other.mjs';
        writeFileSync(join(dir, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        expect(result.code).toBe(1);
        const report = JSON.parse(result.out) as Document;
        expect(report.checks.find((check) => check.id === 'route-parity:*')).toMatchObject({
            status: 'fail',
            message: expect.stringContaining('spans multiple lines'),
        });
        // One malformed script must not discard the checks around it.
        expect(report.checks.find((check) => check.id === 'doctor')?.status).toBe('pass');
        expect(report.checks.find((check) => check.id === 'mcp-stdio:tools/list')?.status).toBe('pass');
    });

    it('caps the probe buffer when the mcp script floods stdout', async () => {
        const dir = createApp({ floodsStdout: true });
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        expect(result.code).toBe(1);
        const report = JSON.parse(result.out) as Document;
        expect(report.checks.find((check) => check.id === 'route-parity:*')?.message).toContain('more than');
    });

    it('boots each app script once per run', async () => {
        const dir = createApp();
        // Counting variants: every boot appends one mark, so duplicate
        // spawns cannot hide behind a green report (issue #730).
        writeFileSync(
            join(dir, 'inspect.mjs'),
            `import { appendFileSync } from 'node:fs';\nappendFileSync('inspect.count', 'x');\nprocess.stdout.write(${JSON.stringify(JSON.stringify(FIXTURE_MANIFEST))});\n`
        );
        writeFileSync(
            join(dir, 'mcp.mjs'),
            `import { appendFileSync } from 'node:fs';\nimport { createInterface } from 'node:readline';\nconst rl = createInterface({ input: process.stdin });\nconst send = (value) => process.stdout.write(JSON.stringify(value) + '\\n');\nlet counted = false;\nrl.on('line', (line) => {\n    if (!counted) {\n        counted = true;\n        appendFileSync('mcp.count', 'x');\n    }\n    const message = JSON.parse(line);\n    if (message.method === 'initialize') {\n        send({ jsonrpc: '2.0', id: message.id, result: { protocolVersion: '2024-11-05', capabilities: {}, serverInfo: { name: 'fixture', version: '1' } } });\n    } else if (message.method === 'tools/list') {\n        send({ jsonrpc: '2.0', id: message.id, result: { tools: [{ name: 'lookup_order', inputSchema: { type: 'object' } }] } });\n    }\n});\n`
        );
        const result = await runCli(['verify', '--capability', 'agent-surface', '--json', dir]);
        expect(result.code).toBe(0);
        expect(readFileSync(join(dir, 'inspect.count'), 'utf8')).toBe('x');
        expect(readFileSync(join(dir, 'mcp.count'), 'utf8')).toBe('x');
    });
});
