/**
 * Real-bin integration lane (AD-75): every command exercised through
 * `lib/bin/run.js` as an actual subprocess — exit codes, help surface,
 * usage errors, and the `serve` end-to-end signal-relay drain. Requires
 * `build:lib` (the nx lane builds it; `pnpm --filter @ndigo/cli test` in
 * isolation needs a prior build).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect, beforeAll } from 'vitest';
import { mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { kill } from 'node:process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setTimeout as delay } from 'node:timers/promises';

/** The compiled bin — the nx lane runs build:lib before test. */
const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');

async function runCli(args: string[], cwd?: string): Promise<{ code: number; out: string; err: string }> {
    const proc = spawn(process.execPath, [BIN, ...args], { cwd, stdio: ['ignore', 'pipe', 'pipe'] });
    const out: string[] = [];
    const err: string[] = [];
    if (proc.stdout !== null) {
        void (async () => {
            for await (const chunk of proc.stdout) {
                out.push(String(chunk));
            }
        })().catch(() => undefined);
    }
    if (proc.stderr !== null) {
        void (async () => {
            for await (const chunk of proc.stderr) {
                err.push(String(chunk));
            }
        })().catch(() => undefined);
    }
    const code = await new Promise<number>((resolveCode) => {
        proc.once('exit', resolveCode);
    });
    await delay(20); // let the pipes drain
    return { code, out: out.join(''), err: err.join('') };
}

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
    for (let attempt = 0; attempt < 400; attempt += 1) {
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling: each check must observe the previous state
        if (await predicate()) {
            return;
        }
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling interval
        await delay(5);
    }
    throw new Error('waitFor: condition not reached in time');
}

let base: string;
let appDir: string;

beforeAll(() => {
    base = join('/tmp', `ndigo-cli-e2e-${process.pid}`);
    mkdirSync(base, { recursive: true });
    appDir = join(base, 'app');
    mkdirSync(appDir, { recursive: true });
    writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ name: 'e2e-app', private: true, scripts: { start: 'node app.mjs' } })
    );
    writeFileSync(
        join(appDir, 'app.mjs'),
        `
const { writeFileSync } = await import('node:fs');
process.on('SIGTERM', () => {
  writeFileSync(${JSON.stringify(join(base, 'drained.signal'))}, process.env.PORT ?? 'no-port');
  process.exit(0);
});
writeFileSync(${JSON.stringify(join(base, 'app.up'))}, process.env.PORT ?? 'no-port');
setTimeout(() => {}, 120_000);
`
    );
});

describe('ndigo (real bin)', () => {
    test('--version prints the CLI version and exits 0', async () => {
        const { code, out } = await runCli(['--version']);
        expect(code).toBe(0);
        expect(out).toContain('@ndigo/cli/');
    });

    test('--help lists the v1 surface', async () => {
        const { code, out } = await runCli(['--help']);
        expect(code).toBe(0);
        for (const command of ['serve', 'dev', 'new', 'generate', 'inspect', 'doctor']) {
            expect(out).toContain(command);
        }
        expect(out).toContain('db');
    });

    test('doctor prints the environment diagnostics', async () => {
        const { code, out } = await runCli(['doctor']);
        expect(code).toBe(0); // healthy environment on the dev machine
        expect(out).toContain('ndigo ');
        expect(out).toContain('node v');
        expect(out).toContain('pnpm ');
    });

    test('doctor reports the workspace root by walking to pnpm-workspace.yaml (AD75-H1)', async () => {
        // BIN lives at <repo>/packages/ndigo-cli/bin/run.js; running doctor
        // with the repo root as cwd must yield the ROOT (a walk up to
        // pnpm-workspace.yaml), never the `pnpm root` node_modules dir.
        const repoRoot = resolve(dirname(BIN), '..', '..', '..');
        const { code, out } = await runCli(['doctor'], repoRoot);
        expect(code).toBe(0); // we ARE inside the workspace here
        const line = out.split('\n').find((row) => row.startsWith('workspace ')) ?? '';
        expect(line).toBe(`workspace ${repoRoot}`);
    });

    test('doctor exits non-zero outside a workspace (AD75-H1 regression)', async () => {
        const outside = join(base, 'outside');
        mkdirSync(outside, { recursive: true });
        const proc = spawn(process.execPath, [BIN, 'doctor'], { cwd: outside, stdio: ['ignore', 'pipe', 'pipe'] });
        const out: string[] = [];
        const err: string[] = [];
        if (proc.stdout !== null) {
            void (async () => {
                for await (const chunk of proc.stdout) {
                    out.push(String(chunk));
                }
            })().catch(() => undefined);
        }
        if (proc.stderr !== null) {
            void (async () => {
                for await (const chunk of proc.stderr) {
                    err.push(String(chunk));
                }
            })().catch(() => undefined);
        }
        const code = await new Promise<number>((resolveCode) => {
            proc.once('exit', resolveCode);
        });
        await delay(20);
        expect(code).toBe(1);
        expect(`${out.join('')}${err.join('')}`).toContain('pnpm-workspace.yaml');
    });

    test('generate rejects unknown kinds with a usage error', async () => {
        const { code, out, err } = await runCli(['generate', 'wat']);
        expect(code).toBe(2);
        expect(`${out}${err}`).toContain("unknown generator 'wat'");
    });

    test('generate points at `ndigo new` for the app kind (AD-85)', async () => {
        const { code, out, err } = await runCli(['generate', 'app', '--name', 'widget']);
        expect(code).toBe(2);
        expect(`${out}${err}`).toContain('ndigo new <name>');
    });

    test('inspect without a convention entry fails loud', async () => {
        const dir = join(base, 'no-inspect');
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, 'package.json'), JSON.stringify({ name: 'x', scripts: {} }));
        const { code, out, err } = await runCli(['inspect', dir]);
        expect(code).toBe(2);
        expect(`${out}${err}`).toContain('no "inspect" script');
    });

    test('serve runs the app and relays SIGTERM into its own drain (exit 0)', async () => {
        const port = '4301';
        const proc = spawn(process.execPath, [BIN, 'serve', appDir, '--port', port], { stdio: 'inherit' });
        try {
            // The marker can exist before its content lands (writeFileSync opens
            // the file first) — wait for the value, not the name (CI flake 2026-10-31).
            await waitFor(
                () => existsSync(join(base, 'app.up')) && readFileSync(join(base, 'app.up'), 'utf8') === port
            );
            expect(readFileSync(join(base, 'app.up'), 'utf8')).toBe(port);

            kill(proc.pid ?? 0, 'SIGTERM');
            // Same visible-before-complete guard for the drain marker.
            await waitFor(
                () =>
                    existsSync(join(base, 'drained.signal')) &&
                    readFileSync(join(base, 'drained.signal'), 'utf8') === port
            );
            expect(readFileSync(join(base, 'drained.signal'), 'utf8')).toBe(port);

            const code = await new Promise<number>((resolveCode) => {
                proc.once('exit', resolveCode);
            });
            expect(code).toBe(0);
        } finally {
            rmSync(join(base, 'app.up'), { force: true });
            rmSync(join(base, 'drained.signal'), { force: true });
            if (proc.pid !== undefined) {
                try {
                    kill(proc.pid, 'SIGKILL');
                } catch {
                    // already gone
                }
            }
        }
    });

    test('serve --cluster 2 derives distinct per-slot PORTs (base + slot)', async () => {
        const clusterDir = join(base, 'cluster-app');
        mkdirSync(clusterDir, { recursive: true });
        writeFileSync(
            join(clusterDir, 'package.json'),
            JSON.stringify({ name: 'e2e-cluster-app', private: true, scripts: { start: 'node app.mjs' } })
        );
        writeFileSync(
            join(clusterDir, 'app.mjs'),
            `
const { writeFileSync } = await import('node:fs');
const { join } = await import('node:path');
const slot = process.env.NDIGO_CLUSTER_SLOT ?? '?';
writeFileSync(join(${JSON.stringify(base)}, 'cluster-' + slot + '.up'), process.env.PORT ?? 'no-port');
process.on('SIGTERM', () => {
  writeFileSync(join(${JSON.stringify(base)}, 'cluster-' + slot + '.signal'), 'x');
  process.exit(0);
});
setTimeout(() => {}, 120_000);
`
        );

        const port = '4401';
        const proc = spawn(process.execPath, [BIN, 'serve', clusterDir, '--port', port, '--cluster', '2'], {
            stdio: 'inherit',
        });
        try {
            // Both slots must be up with PORT = base + slot (BLK-2: the flat
            // env.PORT bug gave every slot the same port).
            await waitFor(() => existsSync(join(base, 'cluster-0.up')) && existsSync(join(base, 'cluster-1.up')));
            expect(readFileSync(join(base, 'cluster-0.up'), 'utf8')).toBe(port);
            expect(readFileSync(join(base, 'cluster-1.up'), 'utf8')).toBe(String(Number(port) + 1));

            // A single SIGTERM reaches the supervisor, which relays into both
            // children's drains — never respawns.
            kill(proc.pid ?? 0, 'SIGTERM');
            await waitFor(
                () => existsSync(join(base, 'cluster-0.signal')) && existsSync(join(base, 'cluster-1.signal'))
            );
            const code = await new Promise<number>((resolveCode) => {
                proc.once('exit', resolveCode);
            });
            expect(code).toBe(0);
        } finally {
            for (const slot of ['0', '1']) {
                rmSync(join(base, `cluster-${slot}.up`), { force: true });
                rmSync(join(base, `cluster-${slot}.signal`), { force: true });
            }
            rmSync(clusterDir, { recursive: true, force: true });
            if (proc.pid !== undefined) {
                try {
                    kill(proc.pid, 'SIGKILL');
                } catch {
                    // already gone
                }
            }
        }
    }, 20_000);
});

describe('ndigo db (AD-78)', () => {
    let dbAppDir: string;

    beforeAll(() => {
        dbAppDir = join(base, 'db-app');
        mkdirSync(dbAppDir, { recursive: true });
        writeFileSync(join(dbAppDir, 'package.json'), JSON.stringify({ name: 'db-app', private: true, scripts: {} }));
    });

    test('db new scaffolds the next versioned migration file', async () => {
        const first = await runCli(['db', 'new', dbAppDir, 'add-title-column']);
        expect(first.code).toBe(0);
        expect(first.out).toContain('0001-add-title-column.ts');

        const target = join(dbAppDir, 'db', 'migrations', '0001-add-title-column.ts');
        expect(existsSync(target)).toBe(true);
        const source = readFileSync(target, 'utf8');
        expect(source).toContain('version: 1,');
        expect(source).toContain('description: "add-title-column",');
        expect(source).toContain('export default migration;');

        // The next scaffold probes past the highest version.
        const second = await runCli(['db', 'new', dbAppDir, 'another']);
        expect(second.code).toBe(0);
        expect(existsSync(join(dbAppDir, 'db', 'migrations', '0002-another.ts'))).toBe(true);
    });

    test('db new normalizes the slug for the filename', async () => {
        const { code, out } = await runCli(['db', 'new', dbAppDir, 'Add  Column!']);
        expect(code).toBe(0);
        expect(out).toContain('0003-add-column.ts');
    });

    test('db generate and db status fail loud with the script hint when undeclared', async () => {
        const results = await Promise.all(['generate', 'status'].map((script) => runCli(['db', script, dbAppDir])));
        for (const [script, { code, out, err }] of results.map(
            (result, index) => [['generate', 'status'][index], result] as const
        )) {
            expect(code).toBe(2);
            expect(`${out}${err}`).toContain(`db:${script}`);
        }
    });
});
