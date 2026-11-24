// @vitest-environment node
/**
 * The capability catalog: the shipped entries, the `ndigo capabilities`
 * verbs, the JSON contract, and the reference-integrity failures `check`
 * reports.
 */
import { spawn } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    getCatalogEntry,
    listCatalog,
    loadCatalog,
    loadCheckIds,
    loadCheckTargets,
    loadGuideSlugs,
    loadPackageFacts,
    loadSkillIds,
} from '../src/capabilities/catalog.js';
import type { CatalogLoad } from '../src/capabilities/catalog.js';
import { validateCatalog } from '../src/capabilities/validate.js';
import type { CatalogReferences } from '../src/capabilities/validate.js';

/** The compiled bin — the nx lane runs build:lib before test. */
const BIN = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'bin', 'run.js');

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

function references(overrides: Partial<CatalogReferences> = {}): CatalogReferences {
    return {
        guides: new Set(loadGuideSlugs()),
        skills: new Set(loadSkillIds()),
        packages: new Map(loadPackageFacts().map((fact) => [fact.name, fact])),
        checks: new Set(loadCheckIds()),
        checkTargets: loadCheckTargets(),
        ...overrides,
    };
}

function catalogOf(capabilities: CatalogLoad['capabilities'], items: CatalogLoad['items'] = []): CatalogLoad {
    return { capabilities, items, errors: [] };
}

const AGENT_SURFACE = {
    id: 'agent-surface',
    kind: 'capability' as const,
    summary: 'Fixture capability.',
    packages: ['@ndigo/mcp'],
    guide: '48-agent-facing-surfaces',
    ops: [{ op: 'addDependency' as const, packages: ['@ndigo/mcp'] }],
    checks: ['mcp-stdio:tools/list'],
};

describe('shipped catalog', () => {
    it('loads the declared capabilities and the UI item index', () => {
        const catalog = loadCatalog();
        expect(catalog.errors).toEqual([]);
        expect(catalog.capabilities.map((capability) => capability.id)).toEqual([
            'agent-model',
            'agent-surface',
            'background-jobs',
            'shared-cache',
        ]);
        expect(catalog.items.length).toBeGreaterThan(0);
        expect(catalog.items.every((item) => item.kind === 'item')).toBe(true);
    });

    it('passes reference integrity', () => {
        expect(validateCatalog(loadCatalog(), references())).toEqual([]);
    });

    it('declares package facts for every capability package', () => {
        const facts = new Map(loadPackageFacts().map((fact) => [fact.name, fact]));
        expect(facts.get('@ndigo/mcp')?.capabilities).toEqual(['agent-surface']);
        expect(facts.get('@ndigo/ai')?.capabilities).toEqual(['agent-model']);
        expect(facts.get('@ndigo/ai-sdk')?.capabilities).toEqual(['agent-model']);
    });
});

describe('reference integrity', () => {
    it('reports a capability naming an undeclared package', () => {
        const problems = validateCatalog(
            catalogOf([{ ...AGENT_SURFACE, packages: ['@ndigo/nonexistent'] }]),
            references()
        );
        expect(problems).toContain('capability "agent-surface" names unknown package "@ndigo/nonexistent"');
    });

    it('reports a package that omits the capability it composes', () => {
        const facts = new Map(loadPackageFacts().map((fact) => [fact.name, fact]));
        const mcp = facts.get('@ndigo/mcp');
        if (mcp === undefined) throw new Error('missing @ndigo/mcp package fact');
        facts.set('@ndigo/mcp', { ...mcp, capabilities: [] });
        expect(validateCatalog(catalogOf([AGENT_SURFACE]), references({ packages: facts }))).toContain(
            'capability "agent-surface" names @ndigo/mcp, but its manifest does not declare the capability'
        );
    });

    it('reports a package whose capability names another package', () => {
        const problems = validateCatalog(catalogOf([{ ...AGENT_SURFACE, packages: ['@ndigo/ai'] }]), references());
        expect(problems).toContain(
            'package @ndigo/mcp declares "agent-surface", but the capability does not name the package'
        );
    });

    it('reports an unknown guide and an unknown check', () => {
        const problems = validateCatalog(
            catalogOf([{ ...AGENT_SURFACE, guide: '99-missing', checks: ['nope:any'] }]),
            references()
        );
        expect(problems).toContain('capability "agent-surface" names unknown guide "99-missing"');
        expect(problems).toContain('capability "agent-surface" names unknown check "nope:any"');
    });

    it('reports a check naming an unsupported target', () => {
        // A typo'd target used to pass `ndigo capabilities check` and fail
        // only later, at verify time.
        const problems = validateCatalog(
            catalogOf([{ ...AGENT_SURFACE, checks: ['mcp-stdio:resources/list'] }]),
            references()
        );
        expect(problems).toContain(
            'capability "agent-surface" check "mcp-stdio:resources/list" has an unsupported target — known targets: tools/list'
        );
    });

    it('reports a missing template', () => {
        const problems = validateCatalog(
            catalogOf([
                {
                    ...AGENT_SURFACE,
                    ops: [{ op: 'writeFile', template: 'templates/missing.tmpl', path: 'src/mcp.ts' }],
                },
            ]),
            references()
        );
        expect(problems).toContain('capability "agent-surface" is missing template "templates/missing.tmpl"');
    });

    it('reports a write outside the application', () => {
        const problems = validateCatalog(
            catalogOf([
                {
                    ...AGENT_SURFACE,
                    ops: [{ op: 'writeFile', template: 'templates/mcp.ts.tmpl', path: '../outside.ts' }],
                },
            ]),
            references()
        );
        expect(problems).toContain('capability "agent-surface" writes outside the app: "../outside.ts"');
    });

    it('reports duplicate ids across capabilities and items', () => {
        const item = {
            kind: 'item' as const,
            id: 'agent-surface',
            type: 'registry:ui',
            title: 'Collision',
        };
        expect(validateCatalog(catalogOf([AGENT_SURFACE], [item]), references())).toContain(
            'duplicate id "agent-surface" (capability and item)'
        );
    });
});

describe('ndigo capabilities', () => {
    it('lists capabilities and items in one sorted index', async () => {
        const result = await runCli(['capabilities']);
        expect(result.code).toBe(0);
        const rows = result.out.trim().split('\n');
        expect(rows).toHaveLength(listCatalog().length);
        expect(rows[0]?.startsWith('a2ui-surface\titem\tndigo ui add a2ui-surface')).toBe(true);
        expect(rows).toContain('agent-surface\tcapability\t@ndigo/mcp');
    });

    it('emits the same index as JSON', async () => {
        const result = await runCli(['capabilities', '--json']);
        expect(result.code).toBe(0);
        const document = JSON.parse(result.out) as {
            version: number;
            count: number;
            entries: { id: string; kind: string; install?: string; packages?: string[] }[];
        };
        expect(document.version).toBe(1);
        expect(document.count).toBe(document.entries.length);
        const ids = document.entries.map((entry) => entry.id);
        expect(ids).toEqual([...ids].sort());
        const surface = document.entries.find((entry) => entry.id === 'agent-surface');
        expect(surface).toEqual({
            id: 'agent-surface',
            kind: 'capability',
            summary: expect.any(String),
            packages: ['@ndigo/mcp'],
        });
        expect(document.entries.find((entry) => entry.kind === 'item')?.install).toMatch(/^ndigo ui add /u);
    });

    it('returns one entry with its wiring operations', async () => {
        const result = await runCli(['capabilities', 'get', 'agent-model', '--json']);
        expect(result.code).toBe(0);
        expect(JSON.parse(result.out)).toMatchObject({
            id: 'agent-model',
            kind: 'capability',
            packages: ['@ndigo/ai', '@ndigo/ai-sdk'],
            guide: '47-ai-agents',
            ops: [{ op: 'addDependency', packages: ['@ndigo/ai', '@ndigo/ai-sdk'] }, { op: 'writeFile' }],
        });
    });

    it('fails a missing id and an unknown action with usage exit 2', async () => {
        const missing = await runCli(['capabilities', 'get']);
        expect(missing.code).toBe(2);

        const unknown = await runCli(['capabilities', 'get', 'no-such-capability']);
        expect(unknown.code).toBe(2);
        expect(unknown.err).toContain("unknown capability or item 'no-such-capability'");

        const action = await runCli(['capabilities', 'nope']);
        expect(action.code).toBe(2);
        expect(action.err).toContain("unknown action 'nope'");
    });

    it('validates the catalog', async () => {
        const result = await runCli(['capabilities', 'check', '--json']);
        expect(result.code).toBe(0);
        expect(JSON.parse(result.out)).toEqual({
            valid: true,
            capabilities: 4,
            items: expect.any(Number),
            errors: [],
        });
    });

    it('resolves entries by id', () => {
        expect(getCatalogEntry('agent-surface')?.record.kind).toBe('capability');
        expect(getCatalogEntry('no-such-capability')).toBeUndefined();
    });
});
