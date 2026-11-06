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

async function runCli(
    args: string[],
    cwd?: string,
    env?: NodeJS.ProcessEnv
): Promise<{ code: number; out: string; err: string }> {
    const proc = spawn(process.execPath, [BIN, ...args], {
        cwd,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: env === undefined ? process.env : { ...process.env, ...env },
    });
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
        // Assert the Digits, not just the prefix: the version read used to
        // fall back to 0.0.1 from an unresolvable path (issue #146) and the
        // prefix-only assert could not catch the next-version breakage.
        const pkgVersion = (
            JSON.parse(readFileSync(resolve(dirname(BIN), '..', 'package.json'), 'utf8')) as {
                version: unknown;
            }
        ).version as string;
        expect(out.trim()).toBe(`@ndigo/cli/${pkgVersion}`);
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

    test('doctor without pnpm on PATH reports it instead of crashing (issue #144)', async () => {
        // An empty PATH means both `pnpm` and `git` cannot spawn: before the
        // issue-#144 fix the raw `Error: spawn pnpm ENOENT` stack escaped and
        // the pnpm row lied healthy.
        const noPnpmDir = join(base, 'empty-path');
        mkdirSync(noPnpmDir, { recursive: true });
        const { code, out, err } = await runCli(['doctor'], undefined, { PATH: noPnpmDir });
        expect(code).toBe(1);
        expect(out).toContain('pnpm n/a (not found)');
        expect(out).toContain('pnpm is not on PATH');
        expect(`${out}${err}`).not.toContain('Error: spawn pnpm');
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
        const exitPromise = new Promise<number>((resolveCode) => {
            proc.once('exit', resolveCode);
        });
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

            const code = await exitPromise;
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
    }, 10_000);

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
        const clusterExitPromise = new Promise<number>((resolveCode) => {
            proc.once('exit', resolveCode);
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
            const code = await clusterExitPromise;
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

describe('ndigo update (issue #144 manifest boundary)', () => {
    let noPnpmDir: string;

    let fixtureIndex = 0;

    function appWith(depSpec: string): string {
        fixtureIndex += 1;
        const dir = join(base, `update-${process.pid}-${fixtureIndex}`);
        mkdirSync(dir, { recursive: true });
        writeFileSync(
            join(dir, 'package.json'),
            JSON.stringify({ name: 'update-app', private: true, dependencies: { '@ndigo/core': depSpec } })
        );
        return dir;
    }

    beforeAll(() => {
        noPnpmDir = join(base, 'empty-path-update');
        mkdirSync(noPnpmDir, { recursive: true });
    });

    test('--check with a broken-shape manifest exits 2 with a clean message (no TypeError)', async () => {
        const dir = appWith('0.0.1');
        writeFileSync(join(dir, 'ndigo-versions.json'), '{}');
        const { code, out, err } = await runCli(['update', '--check', dir]);
        expect(code).toBe(2);
        expect(err).toContain('invalid version manifest');
        expect(`${out}${err}`).not.toContain('TypeError');
        expect(`${out}${err}`).not.toContain('    at ');
    });

    test('apply refuses alias specs and leaves package.json untouched', async () => {
        const dir = appWith('0.0.1');
        writeFileSync(
            join(dir, 'ndigo-versions.json'),
            JSON.stringify({ packages: { '@ndigo/core': 'npm:@evil/companion@1.0.0' } })
        );
        const before = readFileSync(join(dir, 'package.json'), 'utf8');
        const { code, out, err } = await runCli(['update', dir]);
        expect(code).toBe(2);
        expect(err).toContain('not an exact version pin');
        expect(readFileSync(join(dir, 'package.json'), 'utf8')).toBe(before);
        expect(out).not.toContain('Updated package.json');
    });

    test('apply pins the dependency, then reports the missing pnpm as 127', async () => {
        const dir = appWith('^0.0.1');
        writeFileSync(join(dir, 'ndigo-versions.json'), JSON.stringify({ packages: { '@ndigo/core': '1.2.3' } }));
        const { code, err } = await runCli(['update', dir], undefined, { PATH: noPnpmDir });
        expect(JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).dependencies['@ndigo/core']).toBe('1.2.3');
        expect(code).toBe(127);
        expect(err).toContain('is not available on PATH');
        expect(`${err}`).not.toContain('Error: spawn pnpm');
    });

    test('apply without a manifest fails loud instead of falling through to pnpm install', async () => {
        const dir = appWith('0.0.1');
        const { code, out, err } = await runCli(['update', dir], undefined, { PATH: noPnpmDir });
        expect(code).toBe(2);
        expect(err).toContain('no version manifest to apply');
        expect(`${out}${err}`).not.toContain('TypeError');
    });
});

describe('ndigo logs (issue #146 byte-faithful follow)', () => {
    let logsAppDir: string;
    let logFile: string;

    beforeAll(() => {
        logsAppDir = join(base, 'logs-app');
        mkdirSync(join(logsAppDir, 'logs'), { recursive: true });
        logFile = join(logsAppDir, 'logs', 'app.log');
    });

    test('missing file exits 2 with a clean message', async () => {
        const emptyDir = join(base, 'logs-empty');
        mkdirSync(emptyDir, { recursive: true });
        const { code, err } = await runCli(['logs', emptyDir]);
        expect(code).toBe(2);
        expect(err).toContain('log file not found');
    });

    test('--lines 0 and fractional counts are refused, non-numbers rejected by the parser', async () => {
        writeFileSync(logFile, 'l-1\nl-2\nl-3\n');
        const zero = await runCli(['logs', '--lines', '0', logsAppDir]);
        expect(zero.code).toBe(2);
        expect(zero.err).toContain('--lines must be a positive integer');

        const parsed = await runCli(['logs', '--lines', 'abc', logsAppDir]);
        expect(parsed.code).not.toBe(0);
        expect(`${parsed.out}${parsed.err}`).toContain('lines');
    });

    test('the tail prints the last n lines byte-exactly (multibyte seed)', async () => {
        writeFileSync(logFile, 'l-1\nmulti-é-2\nl-3\nβ-4\nl-5\n');
        const { code, out } = await runCli(['logs', '--lines', '2', logsAppDir]);
        expect(code).toBe(0);
        expect(out).toBe('β-4\nl-5\n');
    });

    test('follow prints growth and rotated content intact, exits 0 on SIGTERM', async () => {
        writeFileSync(logFile, 'line-1\nline-2\nseed-é-β-3\n');
        const proc = spawn(process.execPath, [BIN, 'logs', '--follow', logsAppDir], {
            cwd: logsAppDir,
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const captured: string[] = [];
        if (proc.stdout !== null) {
            void (async () => {
                for await (const chunk of proc.stdout) captured.push(String(chunk));
            })().catch(() => undefined);
        }
        const out = (): string => captured.join('');
        const exitCode = new Promise<number>((resolveCode) => proc.once('exit', resolveCode));
        try {
            await waitFor(() => out().includes('seed-é-β-3'));
            const { writeFile: rewrite } = await import('node:fs/promises');
            await rewrite(logFile, 'line-1\nline-2\nseed-é-β-3\ngrowth-α✓-4\n');
            await waitFor(() => out().includes('growth-α✓-4'));
            // Rotation: the file is truncated to a smaller body (same inode
            // or a new one — both follow the size<position reopen path).
            await rewrite(logFile, 'rotated-ε-0\n');
            await waitFor(() => out().includes('rotated-ε-0'));
        } finally {
            kill(proc.pid ?? 0, 'SIGTERM');
            const code = await exitCode;
            expect(code).toBe(0);
            // The trailing empty tick must not re-print a stale full file.
            await delay(250);
            expect(out().split('rotated-ε-0').length).toBeLessThanOrEqual(3);
        }
    }, 15_000);
});

describe('ndigo clean (issue #146 --force gate)', () => {
    let cleanChain = 0;

    function cleanAppWithDist(): { dir: string; distPath: string } {
        cleanChain += 1;
        const dir = join(base, `clean-${process.pid}-${cleanChain}`);
        mkdirSync(join(dir, 'dist'), { recursive: true });
        writeFileSync(
            join(dir, 'package.json'),
            JSON.stringify({ name: 'clean-app', private: true })
        );
        writeFileSync(join(dir, 'dist', 'artifact.js'), 'export {};\n');
        return { dir, distPath: join(dir, 'dist') };
    }

    test('plain clean is refused and removes nothing', async () => {
        const { dir, distPath } = cleanAppWithDist();
        const { code, err } = await runCli(['clean', dir]);
        expect(code).toBe(2);
        expect(err).toContain('refusing to clean without --force');
        expect(existsSync(distPath)).toBe(true);
    });

    test('--dryRun previews and keeps everything', async () => {
        const { dir, distPath } = cleanAppWithDist();
        const { code, out } = await runCli(['clean', dir, '--dryRun']);
        expect(code).toBe(0);
        expect(out).toContain('would remove');
        expect(existsSync(distPath)).toBe(true);
    });

    test('--force removes the target directories', async () => {
        const { dir, distPath } = cleanAppWithDist();
        const { code, out } = await runCli(['clean', '--force', dir]);
        expect(code).toBe(0);
        expect(out).toContain('removed');
        expect(existsSync(distPath)).toBe(false);
    });

    test('$HOME-matching dirs are protected regardless of --force', async () => {
        const { dir } = cleanAppWithDist();
        const { code, err } = await runCli(['clean', '--force', dir], undefined, { HOME: dir });
        expect(code).toBe(2);
        expect(err).toContain('refusing to clean protected path');
    });
});

describe('ndigo config (issue #146 edges)', () => {
    let cfgChain = 0;

    function cfgDir(): string {
        cfgChain += 1;
        const dir = join(base, `config-${process.pid}-${cfgChain}`);
        mkdirSync(dir, { recursive: true });
        return dir;
    }

    test('set requires a value; get reports absence as null; unknown action is a usage error', async () => {
        const dir = cfgDir();
        const missing = await runCli(['config', 'get', 'absent'], dir);
        expect(missing.code).toBe(0);
        expect(missing.out).toBe('null\n');

        const noValue = await runCli(['config', 'set', 'k2'], dir);
        expect(noValue.code).toBe(2);
        expect(noValue.err).toContain('a value is required');
        expect(existsSync(join(dir, '.ndigorc.json'))).toBe(false);

        const unknown = await runCli(['config', 'patch', 'k'], dir);
        expect(unknown.code).toBe(2);
        expect(unknown.err).toContain('Unknown config action');
    });

    test('set writes, get reads back, --list shows the pair', async () => {
        const dir = cfgDir();
        const setResult = await runCli(['config', 'set', 'probe', 'v-1'], dir);
        expect(setResult.code).toBe(0);
        expect(setResult.out).toContain('set probe');
        expect(readFileSync(join(dir, '.ndigorc.json'), 'utf8')).toContain('"probe": "v-1"');

        const getResult = await runCli(['config', 'get', 'probe'], dir);
        expect(getResult.out).toBe('"v-1"\n');

        const listResult = await runCli(['config', 'list'], dir);
        expect(listResult.out).toBe('probe="v-1"\n');
    });
});
