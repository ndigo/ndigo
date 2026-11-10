// @vitest-environment node
/**
 * The `--json` contract: one document on stdout, diagnostics on stderr, exit
 * codes unchanged, and human output untouched when the flag is absent.
 */
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

/** The compiled bin — the nx lane runs build:lib before test. */
const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');

const MANIFEST = {
    version: 1,
    generatedAt: '2026-11-09T00:00:00.000Z',
    app: { name: 'fixture', profiles: ['test'] },
    routes: [{ name: 'greeting', path: '/greeting' }],
    mappings: [],
    config: [{ key: 'server.port', type: 'number', hasValue: true }],
};

const TOP_LEVEL = [
    'add',
    'build',
    'clean',
    'commands',
    'completion',
    'config',
    'db',
    'dev',
    'doctor',
    'env',
    'format',
    'generate',
    'info',
    'inspect',
    'lint',
    'logs',
    'mcp',
    'new',
    'openapi',
    'routes',
    'serve',
    'test',
    'typecheck',
    'ui',
    'update',
];
const DB_COMMANDS = ['generate', 'list', 'migrate', 'new', 'pull', 'push', 'rollback', 'seed', 'status', 'studio'];
const UI_COMMANDS = ['add', 'catalog', 'init', 'list', 'mcp', 'validate', 'view'];
const AI_COMMANDS = ['check', 'init', 'update'];

interface Result {
    readonly code: number;
    readonly out: string;
    readonly err: string;
}

function runCli(args: string[], cwd?: string, env?: NodeJS.ProcessEnv): Promise<Result> {
    const proc = spawn(process.execPath, [BIN, ...args], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env === undefined ? process.env : { ...process.env, ...env },
    });
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

function document<T>(result: Result): T {
    expect(result.code).toBeLessThanOrEqual(2);
    return JSON.parse(result.out) as T;
}

let base: string;
let appDir: string;

beforeAll(() => {
    base = mkdtempSync(join(tmpdir(), 'ndigo-cli-json-'));
    appDir = join(base, 'app');
    mkdirSync(join(appDir, 'logs'), { recursive: true });
    writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({
            name: 'fixture',
            type: 'module',
            private: true,
            scripts: {
                inspect: 'node inspect.mjs',
                lint: 'node lint.mjs',
                typecheck: 'node target.mjs',
                openapi: 'node openapi.mjs',
                'db:status': 'node status.mjs',
                build: 'node target.mjs',
            },
        })
    );
    writeFileSync(join(appDir, 'inspect.mjs'), `process.stdout.write(${JSON.stringify(JSON.stringify(MANIFEST))});\n`);
    writeFileSync(
        join(appDir, 'lint.mjs'),
        "process.stdout.write('lint clean\\n');\nprocess.stderr.write('lint note\\n');\n"
    );
    writeFileSync(join(appDir, 'target.mjs'), "process.stdout.write('target ran\\n');\n");
    writeFileSync(
        join(appDir, 'openapi.mjs'),
        "process.stdout.write(JSON.stringify({ openapi: '3.1.0', paths: {} }));\n"
    );
    writeFileSync(join(appDir, 'status.mjs'), "process.stdout.write('version  state\\n0001     applied\\n');\n");
    writeFileSync(join(appDir, 'logs', 'app.log'), 'one\ntwo\nthree\n');
    writeFileSync(join(appDir, '.env.example'), 'NDIGO_JSON_FIXTURE_A=1\nNDIGO_JSON_FIXTURE_B=2\n');
    writeFileSync(join(appDir, '.ndigorc.json'), `${JSON.stringify({ 'db.primary': 'analytics', flag: true })}\n`);
});

afterAll(() => {
    rmSync(base, { recursive: true, force: true });
});

describe('ndigo commands --json', () => {
    it('lists every command with parameters and exit codes', async () => {
        const result = await runCli(['commands', '--json']);
        const index = document<{ commands: { command: string; flags: unknown[]; positionals: unknown[] }[] }>(result);
        expect(index.commands.find((entry) => entry.command === 'commands')).toBeDefined();
        const serve = index.commands.find((entry) => entry.command === 'serve');
        expect(serve?.flags.map((flag) => flag)).toEqual([
            expect.objectContaining({ name: 'cluster', kind: 'parsed' }),
            expect.objectContaining({ name: 'port', kind: 'parsed' }),
        ]);
        expect(serve?.positionals).toEqual([expect.objectContaining({ name: 'dir', optional: true })]);
    });

    it('matches the route map surface', async () => {
        const result = await runCli(['commands', '--json']);
        const index = document<{ commands: { command: string }[] }>(result);
        const expected = [
            ...TOP_LEVEL.filter((name) => name !== 'db' && name !== 'ui' && name !== 'ai'),
            ...DB_COMMANDS.map((name) => `db ${name}`),
            ...UI_COMMANDS.map((name) => `ui ${name}`),
            ...AI_COMMANDS.map((name) => `ai ${name}`),
        ].sort();
        expect(index.commands.map((entry) => entry.command).sort()).toEqual(expected);
    });
});

describe('--json on application and diagnostics commands', () => {
    it('emits the doctor report and keeps the failure exit code', async () => {
        const result = await runCli(['doctor', '--json']);
        const report = document<{ ok: boolean; exitCode: number; rows: string[]; failures: string[] }>(result);
        expect(report.ok).toBe(report.failures.length === 0);
        expect(report.exitCode).toBe(report.ok ? 0 : 1);
        expect(result.code).toBe(report.exitCode);
        expect(report.rows.some((row) => row.startsWith('cwd '))).toBe(true);
    });

    it('emits the info report with installed packages', async () => {
        const result = await runCli(['info', '--json', appDir]);
        const report = document<{ packages: unknown[]; rows: string[]; failures: string[] }>(result);
        expect(report.packages).toEqual([]);
        expect(report.rows.length).toBeGreaterThan(0);
    });

    it('emits a log snapshot and rejects --follow', async () => {
        const snapshot = await runCli(['logs', '--json', '--lines', '2', appDir]);
        expect(document(snapshot)).toEqual({
            file: join(appDir, 'logs', 'app.log'),
            lines: 2,
            content: 'two\nthree\n',
        });

        const follow = await runCli(['logs', '--json', '--follow', appDir]);
        expect(follow.code).toBe(2);
        expect(follow.out).toBe('');
        expect(follow.err).toContain('omit --follow');
    });

    it('emits config entries and rejects other actions', async () => {
        const result = await runCli(['config', 'list', '--json'], appDir);
        expect(document(result)).toEqual({ entries: { 'db.primary': 'analytics', flag: true } });

        const get = await runCli(['config', 'get', '--json', 'flag'], appDir);
        expect(get.code).toBe(2);
        expect(get.err).toContain('only supported for config list');
    });

    it('emits env presence and keeps the missing-key exit code', async () => {
        const result = await runCli(['env', '--json', appDir], undefined, { NDIGO_JSON_FIXTURE_A: 'set' });
        expect(document(result)).toEqual({
            file: join(appDir, '.env.example'),
            entries: [
                { key: 'NDIGO_JSON_FIXTURE_A', present: true },
                { key: 'NDIGO_JSON_FIXTURE_B', present: false },
            ],
            missing: ['NDIGO_JSON_FIXTURE_B'],
            ok: false,
        });
        expect(result.code).toBe(1);
    });

    it('emits routes from the app manifest', async () => {
        const result = await runCli(['routes', '--json', appDir]);
        expect(document(result)).toEqual({ routes: MANIFEST.routes });
    });

    it('captures lint and typecheck output', async () => {
        const lint = await runCli(['lint', '--json', appDir]);
        expect(document(lint)).toEqual({
            target: 'lint',
            exitCode: 0,
            stdout: 'lint clean\n',
            stderr: 'lint note\n',
        });
        expect(lint.code).toBe(0);

        const typecheck = await runCli(['typecheck', '--json', appDir]);
        expect(document(typecheck)).toEqual({
            target: 'typecheck',
            exitCode: 0,
            stdout: 'target ran\n',
            stderr: '',
        });
    });

    it('emits the OpenAPI document', async () => {
        const result = await runCli(['openapi', '--json', appDir]);
        expect(document(result)).toEqual({ openapi: '3.1.0', paths: {} });
    });

    it('captures db status output', async () => {
        const result = await runCli(['db', 'status', '--json', appDir]);
        expect(document(result)).toEqual({
            target: 'db:status',
            exitCode: 0,
            stdout: 'version  state\n0001     applied\n',
            stderr: '',
        });
    });

    it('leaves excluded script fronts without --json', async () => {
        const result = await runCli(['build', '--json', appDir]);
        expect(result.code).not.toBe(0);
        expect(result.out).toBe('');
        expect(result.err).toContain('No flag registered for --json');
    });
});

describe('human output without --json', () => {
    it('keeps logs, config, env, and script-front output byte-identical', async () => {
        expect(await runCli(['logs', '--lines', '2', appDir])).toEqual({
            code: 0,
            out: 'two\nthree\n',
            err: '',
        });
        expect(await runCli(['config', 'list'], appDir)).toEqual({
            code: 0,
            out: 'db.primary="analytics"\nflag=true\n',
            err: '',
        });
        expect(await runCli(['env', appDir], undefined, { NDIGO_JSON_FIXTURE_A: 'set' })).toEqual({
            code: 1,
            out: 'OK      NDIGO_JSON_FIXTURE_A\nMISSING NDIGO_JSON_FIXTURE_B\n',
            err: '',
        });
        expect(await runCli(['lint', appDir])).toEqual({ code: 0, out: 'lint clean\n', err: 'lint note\n' });
        expect((await runCli(['routes', appDir])).out).toBe(JSON.stringify(MANIFEST));
    });
});
