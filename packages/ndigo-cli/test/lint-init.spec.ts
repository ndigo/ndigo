// @vitest-environment node
/**
 * `ndigo lint init` specs: fresh config, ancestor refusal, local config,
 * `--force`, `--json`, and the two drift guards that keep the CLI's rendered
 * copy of the preset and its dependency ranges honest.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';

import { recommended } from '@ndigo/oxlint-plugin/recommended';
import { OXLINT_VERSION_RANGE, PLUGIN_VERSION_RANGE } from '../src/commands/lint/_versions';

const CLI_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REPO_ROOT = resolve(CLI_DIR, '..', '..');
const BIN = join(CLI_DIR, 'bin', 'run.js');

const dirs: string[] = [];

afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

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

/** Creates a temporary project with a manifest, returning its directory. */
function createApp(manifest: Record<string, unknown> = {}): string {
    const dir = mkdtempSync(join(tmpdir(), 'ndigo-lint-init-'));
    dirs.push(dir);
    const base = { name: 'fixture', private: true, ...manifest };
    writeFileSync(join(dir, 'package.json'), `${JSON.stringify(base, null, 2)}\n`);
    return dir;
}

/** Reads a project's `.oxlintrc.json`. */
function readConfig(dir: string): Record<string, unknown> {
    return JSON.parse(readFileSync(join(dir, '.oxlintrc.json'), 'utf8')) as Record<string, unknown>;
}

describe('ndigo lint init', () => {
    it('writes the preset and the lint wiring for a node app', async () => {
        const dir = createApp({
            dependencies: { '@ndigo/platform-node': '~0.0.1' },
            devDependencies: { vitest: '^5.1.0' },
        });

        const result = await runCli(['lint', 'init', dir]);
        expect(result.code).toBe(0);
        expect(existsSync(join(dir, '.oxlintrc.json'))).toBe(true);

        const config = readConfig(dir);
        const { '@ndigo/no-browser-globals': browserGlobals, ...rules } = config.rules as Record<string, unknown>;
        expect(config.env).toEqual({ node: true, es2022: true });
        expect(config.jsPlugins).toEqual(recommended.jsPlugins);
        expect(browserGlobals).toBe('error');
        expect(rules).toEqual(recommended.rules);
        expect(config.globals).toHaveProperty('describe', 'readonly');

        const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as {
            scripts: Record<string, string>;
            devDependencies: Record<string, string>;
        };
        expect(manifest.scripts.lint).toBe('oxlint');
        expect(manifest.devDependencies.oxlint).toBe(OXLINT_VERSION_RANGE);
        expect(manifest.devDependencies['@ndigo/oxlint-plugin']).toBe(PLUGIN_VERSION_RANGE);
        expect(result.out).toContain('pnpm install');
    });

    it('writes the plain preset for a browser app', async () => {
        const dir = createApp({ dependencies: { '@ndigo/platform-web': '~0.0.1' } });

        const result = await runCli(['lint', 'init', dir]);
        expect(result.code).toBe(0);

        const config = readConfig(dir);
        expect(config.env).toEqual({ browser: true, es2022: true });
        expect(config.rules).toEqual(recommended.rules);
        expect(config.globals).toBeUndefined();
    });

    it('refuses when an ancestor config already governs the directory', async () => {
        const outer = mkdtempSync(join(tmpdir(), 'ndigo-lint-outer-'));
        dirs.push(outer);
        writeFileSync(join(outer, '.oxlintrc.json'), '{}\n');
        const app = join(outer, 'app');
        const { mkdirSync } = await import('node:fs');
        mkdirSync(app);
        writeFileSync(join(app, 'package.json'), '{"name":"fixture","private":true}\n');

        const result = await runCli(['lint', 'init', app]);
        expect(result.code).toBe(0);
        expect(result.out).toContain(join(outer, '.oxlintrc.json'));
        expect(existsSync(join(app, '.oxlintrc.json'))).toBe(false);
        const manifest = JSON.parse(readFileSync(join(app, 'package.json'), 'utf8')) as Record<string, unknown>;
        expect(manifest).not.toHaveProperty('scripts');
    });

    it('skips an existing local config and overwrites it with --force', async () => {
        const dir = createApp();
        writeFileSync(join(dir, '.oxlintrc.json'), '{"rules":{"no-debugger":"error"}}\n');

        const skipped = await runCli(['lint', 'init', dir]);
        expect(skipped.code).toBe(0);
        expect(skipped.out).toContain('--force');
        expect(readConfig(dir)).toEqual({ rules: { 'no-debugger': 'error' } });

        const forced = await runCli(['lint', 'init', dir, '--force']);
        expect(forced.code).toBe(0);
        expect(readConfig(dir).rules).toEqual(recommended.rules);
    });

    it('reports the machine result with --json', async () => {
        const dir = createApp();
        const fresh = await runCli(['lint', 'init', dir, '--json']);
        expect(JSON.parse(fresh.out)).toEqual({
            written: true,
            skipped: false,
            configPath: join(dir, '.oxlintrc.json'),
        });

        const again = await runCli(['lint', 'init', dir, '--json']);
        expect(JSON.parse(again.out)).toEqual({
            written: false,
            skipped: true,
            configPath: join(dir, '.oxlintrc.json'),
        });
    });

    it('keeps the rendered rules in sync with the published preset', () => {
        const workspace = readFileSync(resolve(REPO_ROOT, 'pnpm-workspace.yaml'), 'utf8');
        expect(workspace).toContain(`oxlint: '${OXLINT_VERSION_RANGE}'`);

        const plugin = JSON.parse(
            readFileSync(resolve(REPO_ROOT, 'packages/ndigo-oxlint-plugin/package.json'), 'utf8')
        ) as { version: string };
        expect(PLUGIN_VERSION_RANGE).toBe(`~${plugin.version}`);
    });
});
