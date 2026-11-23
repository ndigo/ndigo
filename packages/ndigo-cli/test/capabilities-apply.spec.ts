// @vitest-environment node
/**
 * The capability plan/apply engine and `ndigo add`: classification,
 * idempotence, conflicts, JSON contract, and exit codes.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, describe, expect, it } from 'vitest';
import {
    appNameOf,
    applyCapability,
    planCapability,
    resolveCapability,
    resolveCapabilityVariables,
} from '../src/capabilities/apply.js';
import { loadCatalog } from '../src/capabilities/catalog.js';

/** The compiled bin — the nx lane runs build:lib before test. */
const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');

const catalog = loadCatalog();
const surface = catalog.capabilities.find((capability) => capability.id === 'agent-surface');
if (surface === undefined) throw new Error('missing agent-surface capability');

const SURFACE_VARS = {
    appName: 'app',
    configuration: 'FixtureConfiguration',
    configurationFile: 'app-configuration',
};

const dirs: string[] = [];

afterEach(() => {
    for (const dir of dirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function createApp(dependencies: Record<string, string> = {}): string {
    const dir = mkdtempSync(join(tmpdir(), 'ndigo-capability-'));
    dirs.push(dir);
    writeFileSync(
        join(dir, 'package.json'),
        `${JSON.stringify(
            { name: '@fixture/app', private: true, type: 'module', scripts: {}, dependencies },
            null,
            2
        )}\n`
    );
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

describe('capability resolution', () => {
    it('accepts a capability id and a package name', () => {
        expect(resolveCapability('agent-surface', catalog.capabilities).id).toBe('agent-surface');
        expect(resolveCapability('@ndigo/mcp', catalog.capabilities).id).toBe('agent-surface');
        expect(resolveCapability('@ndigo/ai-sdk', catalog.capabilities).id).toBe('agent-model');
    });

    it('rejects an unknown id and a package no capability installs', () => {
        expect(() => resolveCapability('nope', catalog.capabilities)).toThrow(/unknown capability 'nope'/u);
        expect(() => resolveCapability('@ndigo/redis', catalog.capabilities)).toThrow(
            /no capability installs @ndigo\/redis yet/u
        );
    });

    it('derives appName from a scoped manifest name', () => {
        expect(appNameOf({ name: '@fixture/app' })).toBe('app');
        expect(appNameOf({ name: 'plain' })).toBe('plain');
        expect(appNameOf(null)).toBeUndefined();
    });

    it('resolves defaults, appName, and explicit assignments', () => {
        expect(resolveCapabilityVariables(surface, undefined, 'demo')).toEqual({ appName: 'demo' });
        expect(resolveCapabilityVariables(surface, ['configuration=App', 'configurationFile=app'], 'demo')).toEqual({
            appName: 'demo',
            configuration: 'App',
            configurationFile: 'app',
        });
    });

    it('rejects malformed and unknown variable assignments', () => {
        expect(() => resolveCapabilityVariables(surface, ['configuration'], 'demo')).toThrow(/expected name=value/u);
        expect(() => resolveCapabilityVariables(surface, ['configuration='], 'demo')).toThrow(/needs a value/u);
        expect(() => resolveCapabilityVariables(surface, ['nope=1'], 'demo')).toThrow(/unknown variable 'nope'/u);
    });
});

describe('plan and apply', () => {
    it('plans writes and edits against an app with the dependency declared', () => {
        const dir = createApp({ '@ndigo/mcp': 'link:../../packages/ndigo-mcp' });
        const execution = planCapability(surface, { dir, mode: 'plan', variables: SURFACE_VARS });

        expect(execution.plan.conflicts).toEqual([]);
        expect(execution.plan.dependencies).toEqual([]);
        expect(execution.plan.steps.map((step) => `${step.op}:${step.status}`)).toEqual([
            'addDependency:satisfied',
            'writeFile:pending',
            'editJson:pending',
        ]);
        expect(execution.plan.writes).toEqual([{ path: 'src/mcp.ts', action: 'create' }]);
    });

    it('applies the plan and reports nothing to do on the second run', async () => {
        const dir = createApp({ '@ndigo/mcp': 'link:../../packages/ndigo-mcp' });
        const first = planCapability(surface, { dir, mode: 'apply', variables: SURFACE_VARS });
        const applied = await applyCapability(first, { dir });
        expect(applied.written).toEqual(['src/mcp.ts']);
        expect(applied.edited).toEqual(['package.json#/scripts/mcp']);

        const mcp = readFileSync(join(dir, 'src', 'mcp.ts'), 'utf8');
        expect(mcp).toContain("import { FixtureConfiguration } from './app-configuration';");
        expect(mcp).toContain("name: 'app'");
        expect((JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as { scripts: object }).scripts).toEqual({
            mcp: 'tsx src/mcp.ts',
        });

        const second = planCapability(surface, { dir, mode: 'apply', variables: SURFACE_VARS });
        expect(second.plan.writes).toEqual([]);
        expect(second.plan.steps.every((step) => step.status === 'satisfied')).toBe(true);
        expect(await applyCapability(second, { dir })).toEqual({
            written: [],
            edited: [],
            installed: [],
            skipped: [],
        });
    });

    it('plans missing dependencies without installing when asked to skip', async () => {
        const dir = createApp();
        const execution = planCapability(surface, { dir, mode: 'apply', variables: SURFACE_VARS });
        expect(execution.plan.dependencies).toEqual(['@ndigo/mcp']);
        expect(execution.plan.steps[0]?.status).toBe('pending');

        const result = await applyCapability(execution, { dir, skipInstall: true });
        expect(result.installed).toEqual([]);
        expect(result.skipped).toEqual(['@ndigo/mcp']);
    });

    it('conflicts on a different existing file and forces the update', () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        mkdirSync(join(dir, 'src'), { recursive: true });
        writeFileSync(join(dir, 'src', 'mcp.ts'), '// hand-written\n');

        const conflict = planCapability(surface, { dir, mode: 'plan', variables: SURFACE_VARS });
        expect(conflict.plan.steps.find((step) => step.op === 'writeFile')?.status).toBe('conflict');
        expect(conflict.plan.writes).toEqual([]);

        const forced = planCapability(surface, { dir, mode: 'plan', variables: SURFACE_VARS, force: true });
        expect(forced.plan.writes).toEqual([{ path: 'src/mcp.ts', action: 'update' }]);
    });

    it('conflicts on a different JSON value and forces the update', () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        writeFileSync(
            join(dir, 'package.json'),
            `${JSON.stringify({ name: 'fixture', scripts: { mcp: 'node other.mjs' }, dependencies: { '@ndigo/mcp': 'x' } }, null, 2)}\n`
        );

        const conflict = planCapability(surface, { dir, mode: 'plan', variables: SURFACE_VARS });
        expect(conflict.plan.steps.find((step) => step.op === 'editJson')?.status).toBe('conflict');
        expect(conflict.plan.conflicts).toContain(
            'package.json#/scripts/mcp already has a different value (use --force)'
        );

        const forced = planCapability(surface, { dir, mode: 'plan', variables: SURFACE_VARS, force: true });
        expect(forced.plan.steps.find((step) => step.op === 'editJson')?.status).toBe('pending');
    });

    it('reports unresolved template variables as conflicts', () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        const execution = planCapability(surface, { dir, mode: 'plan', variables: { appName: 'fixture' } });
        expect(execution.plan.conflicts).toEqual([
            'unresolved variable "{{configuration}}" in src/mcp.ts (pass --var configuration=…)',
            'unresolved variable "{{configurationFile}}" in src/mcp.ts (pass --var configurationFile=…)',
        ]);
        expect(execution.plan.writes).toEqual([]);
    });

    it('refuses paths outside the application', () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        const unsafe = {
            ...surface,
            ops: [{ op: 'writeFile' as const, template: 'templates/mcp.ts.tmpl', path: '../x.ts' }],
        };
        expect(planCapability(unsafe, { dir, mode: 'plan', variables: SURFACE_VARS }).plan.conflicts).toContain(
            'refusing to write outside the application: "../x.ts"'
        );
    });
});

describe('ndigo add', () => {
    it('emits a deterministic plan document by default', async () => {
        const dir = createApp({ '@ndigo/mcp': 'link:../../packages/ndigo-mcp' });
        const result = await runCli([
            'add',
            'agent-surface',
            '--json',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
            dir,
        ]);
        expect(result.code).toBe(0);
        const document = JSON.parse(result.out) as {
            capability: string;
            mode: string;
            steps: { op: string; status: string }[];
            conflicts: string[];
            writes: { path: string }[];
            variables: Record<string, string>;
        };
        expect(document.capability).toBe('agent-surface');
        expect(document.mode).toBe('plan');
        expect(document.conflicts).toEqual([]);
        expect(document.writes).toEqual([{ path: 'src/mcp.ts', action: 'create' }]);
        expect(document.variables).toEqual(SURFACE_VARS);
        expect(existsSync(join(dir, 'src', 'mcp.ts'))).toBe(false);
    });

    it('applies with --apply and reports the result', async () => {
        const dir = createApp({ '@ndigo/mcp': 'link:../../packages/ndigo-mcp' });
        const result = await runCli([
            'add',
            'agent-surface',
            '--apply',
            '--json',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
            dir,
        ]);
        expect(result.code).toBe(0);
        const document = JSON.parse(result.out) as { applied: boolean; written: string[]; edited: string[] };
        expect(document.applied).toBe(true);
        expect(document.written).toEqual(['src/mcp.ts']);
        expect(document.edited).toEqual(['package.json#/scripts/mcp']);
        expect(existsSync(join(dir, 'src', 'mcp.ts'))).toBe(true);
    });

    it('resolves a package name to its capability', async () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        const result = await runCli(['add', '@ndigo/mcp', '--json', dir]);
        expect(result.code).toBe(0);
        expect((JSON.parse(result.out) as { capability: string }).capability).toBe('agent-surface');
    });

    it('exits 2 for an unknown target and 1 for apply conflicts', async () => {
        const dir = createApp({ '@ndigo/mcp': 'x' });
        const unknown = await runCli(['add', 'nope', dir]);
        expect(unknown.code).toBe(2);
        expect(unknown.err).toContain("unknown capability 'nope'");

        writeFileSync(
            join(dir, 'package.json'),
            `${JSON.stringify({ name: 'fixture', scripts: { mcp: 'node other.mjs' }, dependencies: { '@ndigo/mcp': 'x' } }, null, 2)}\n`
        );
        const conflict = await runCli([
            'add',
            'agent-surface',
            '--apply',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
            dir,
        ]);
        expect(conflict.code).toBe(1);
        expect(conflict.err).toContain('package.json#/scripts/mcp already has a different value (use --force)');

        const json = await runCli([
            'add',
            'agent-surface',
            '--apply',
            '--json',
            '--var',
            'configuration=FixtureConfiguration',
            '--var',
            'configurationFile=app-configuration',
            dir,
        ]);
        expect(json.code).toBe(1);
        expect(JSON.parse(json.out)).toMatchObject({
            mode: 'apply',
            applied: false,
            conflicts: ['package.json#/scripts/mcp already has a different value (use --force)'],
        });
    });
});
