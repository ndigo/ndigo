// @vitest-environment node
/**
 * Real-bin integration lane for `ndigo ui`: list, validate, init, and add
 * against the repository registry in a temporary application.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(TEST_DIR, '../../..');
const BIN = resolve(TEST_DIR, '..', 'bin', 'run.js');
const REGISTRY = join(REPO_ROOT, 'registry.json');

interface CliRun {
    readonly code: number;
    readonly out: string;
    readonly err: string;
}

function runCli(args: readonly string[]): Promise<CliRun> {
    return new Promise((resolveRun, rejectRun) => {
        const child = spawn(process.execPath, [BIN, ...args], { cwd: REPO_ROOT, stdio: ['ignore', 'pipe', 'pipe'] });
        const out: string[] = [];
        const err: string[] = [];
        child.stdout.on('data', (chunk: Buffer) => out.push(String(chunk)));
        child.stderr.on('data', (chunk: Buffer) => err.push(String(chunk)));
        child.once('error', rejectRun);
        child.once('exit', (code) => resolveRun({ code: code ?? 1, out: out.join(''), err: err.join('') }));
    });
}

let app: string;

beforeAll(() => {
    if (!existsSync(BIN)) throw new Error(`build @ndigo/cli first: ${BIN}`);
    app = join(tmpdir(), `ndigo-ui-cli-${String(process.pid)}`);
    mkdirSync(app, { recursive: true });
    writeFileSync(join(app, 'package.json'), JSON.stringify({ name: 'ui-cli-app', private: true }));
});

afterAll(() => {
    rmSync(app, { recursive: true, force: true });
});

describe('ndigo ui (real bin)', () => {
    test('lists the repository registry', async () => {
        const { code, out } = await runCli(['ui', 'list', '--registry', REGISTRY]);

        expect(code).toBe(0);
        expect(out).toContain('dialog');
        expect(out).toContain('button');
    });

    test('validates the repository registry', async () => {
        const { code, out } = await runCli(['ui', 'validate', '--registry', REGISTRY]);

        expect(code).toBe(0);
        expect(out).toContain('Registry is valid: 6 items');
    });

    test('writes ndigo.ui.json', async () => {
        const { code } = await runCli(['ui', 'init', app, '--registry', REGISTRY]);
        const config = JSON.parse(readFileSync(join(app, 'ndigo.ui.json'), 'utf8')) as { registry: string };

        expect(code).toBe(0);
        expect(config.registry).toBe(REGISTRY);
    });

    test('installs button and reports unchanged on the second run', async () => {
        const first = await runCli(['ui', 'add', 'button', '--dir', app, '--registry', REGISTRY, '--skipInstall']);
        expect(first.code).toBe(0);
        expect(existsSync(join(app, 'src/ui/nd-button/nd-button.css'))).toBe(true);
        expect(existsSync(join(app, 'ui.lock.json'))).toBe(true);

        const second = await runCli(['ui', 'add', 'button', '--dir', app, '--registry', REGISTRY, '--skipInstall']);
        expect(second.code).toBe(0);
        expect(second.out).toContain('unchanged src/ui/nd-button/nd-button.css');
    });

    test('fails unknown items with a usage error', async () => {
        const { code, out, err } = await runCli([
            'ui',
            'add',
            'missing-item',
            '--dir',
            app,
            '--registry',
            REGISTRY,
            '--skipInstall',
        ]);

        expect(code).toBe(2);
        expect(`${out}${err}`).toContain("unknown registry item 'missing-item'");
    });
});
