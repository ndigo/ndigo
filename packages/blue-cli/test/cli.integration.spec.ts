/**
 * Real-bin integration lane (AD-75): every command exercised through
 * `lib/bin/run.js` as an actual subprocess — exit codes, help surface,
 * usage errors, and the `serve` end-to-end signal-relay drain. Requires
 * `build:lib` (the nx lane builds it; `pnpm --filter @blue/cli test` in
 * isolation needs a prior build).
 * @module blue-cli
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

async function runCli(args: string[]): Promise<{ code: number; out: string; err: string }> {
    const proc = spawn(process.execPath, [BIN, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
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
    base = join('/tmp', `blue-cli-e2e-${process.pid}`);
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

describe('blue (real bin)', () => {
    test('--version prints the CLI version and exits 0', async () => {
        const { code, out } = await runCli(['--version']);
        expect(code).toBe(0);
        expect(out).toContain('@blue/cli/');
    });

    test('--help lists the v1 surface', async () => {
        const { code, out } = await runCli(['--help']);
        expect(code).toBe(0);
        for (const command of ['serve', 'dev', 'generate', 'inspect', 'doctor']) {
            expect(out).toContain(command);
        }
        expect(out).toContain('db');
    });

    test('doctor prints the environment diagnostics', async () => {
        const { code, out } = await runCli(['doctor']);
        expect(code).toBe(0);
        expect(out).toContain('blue ');
        expect(out).toContain('node v');
        expect(out).toContain('pnpm ');
    });

    test('generate rejects unknown kinds with a usage error', async () => {
        const { code, out, err } = await runCli(['generate', 'wat']);
        expect(code).toBe(2);
        expect(`${out}${err}`).toContain("unknown generator 'wat'");
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
            await waitFor(() => existsSync(join(base, 'app.up')));
            expect(readFileSync(join(base, 'app.up'), 'utf8')).toBe(port);

            kill(proc.pid ?? 0, 'SIGTERM');
            await waitFor(() => existsSync(join(base, 'drained.signal')));
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
});
