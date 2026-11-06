/**
 * Helper unit specs (AD-75): directory resolution, script discovery, and
 * the pnpm argv the CLI runs — the command/process plumbing in isolation.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { generateArgv } from '../src/commands/generate.js';

import { appScriptCommand, readAppManifest, resolveAppDir } from '../src/helpers/app-scripts.js';

let fixture: string;

beforeAll(() => {
    fixture = join('/tmp', `ndigo-cli-helpers-${process.pid}`);
    mkdirSync(fixture, { recursive: true });
    writeFileSync(
        join(fixture, 'package.json'),
        JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
    );
});

describe('app-scripts helpers', () => {
    test('resolveAppDir resolves relative dirs and rejects non-app directories', () => {
        expect(resolveAppDir(fixture)).toBe(fixture);
        // The '.'-branch resolves against the CALLER's cwd, so make the cwd
        // explicit instead of assuming the lane runs inside this package
        // (root-level `pnpm vitest run ...` runs from the repo root — the
        // sticky '/packages/ndigo-cli' assert broke that lane; issue #152).
        const prevCwd = process.cwd();
        process.chdir(fixture);
        try {
            expect(resolveAppDir('.')).toBe(fixture);
        } finally {
            process.chdir(prevCwd);
        }
        expect(() => resolveAppDir(join('/tmp', 'does-not-exist-xyz'))).toThrow(/not an application directory/);
        expect(() => resolveAppDir('/tmp')).toThrow(/no package.json/);
    });

    test('appScriptCommand resolves the declared script to argv (shell-free)', () => {
        const resolved = appScriptCommand(fixture, 'start', 'hint');
        expect(resolved.argv).toEqual(['tsx', 'src/index.ts']);
        expect(resolved.cwd).toBe(fixture);
        expect(resolved.env.PATH).toContain('node_modules/.bin');
        const scripts = (readAppManifest(fixture)?.['scripts'] ?? {}) as Record<string, unknown>;
        expect(scripts['inspect']).toBe('tsx src/inspect.ts');
    });

    test('appScriptCommand rejects compound scripts loudly (no-shell contract)', () => {
        writeFileSync(
            join(fixture, 'package.json'),
            JSON.stringify({ name: 'b', scripts: { start: 'npm run build && node x.js' } })
        );
        try {
            expect(() => appScriptCommand(fixture, 'start', 'hint')).toThrow(/shell operators/);
        } finally {
            writeFileSync(
                join(fixture, 'package.json'),
                JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
            );
        }
    });

    test('an embedded newline in a declared script fails loud (SEC-005, issue #148)', () => {
        writeFileSync(
            join(fixture, 'package.json'),
            JSON.stringify({ name: 'b', scripts: { dev: 'vite\nbuild' } })
        );
        try {
            // The previous behavior silently glued `build` onto vite's argv:
            // vite ran as an accidental production build instead of the dev
            // server. The guard names the split-script fix.
            expect(() => appScriptCommand(fixture, 'dev', 'hint')).toThrow(
                /spans multiple lines/
            );
        } finally {
            writeFileSync(
                join(fixture, 'package.json'),
                JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
            );
        }
    });

    test('the shell-operator guard also catches $() and backtick substitution (AD75-L1)', () => {        writeFileSync(
            join(fixture, 'package.json'),
            JSON.stringify({ name: 'b', scripts: { start: 'echo $(whoami)' } })
        );
        try {
            expect(() => appScriptCommand(fixture, 'start', 'hint')).toThrow(/shell operators/);
        } finally {
            writeFileSync(
                join(fixture, 'package.json'),
                JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
            );
        }
        writeFileSync(
            join(fixture, 'package.json'),
            JSON.stringify({ name: 'b', scripts: { start: 'echo `whoami`' } })
        );
        try {
            expect(() => appScriptCommand(fixture, 'start', 'hint')).toThrow(/shell operators/);
        } finally {
            writeFileSync(
                join(fixture, 'package.json'),
                JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
            );
        }
    });

    test('appScriptCommand fails loud with the hint when the script is missing', () => {
        expect(() => appScriptCommand(fixture, 'db:migrate', 'add a db:migrate script')).toThrow(
            /no "db:migrate" script.*add a db:migrate script/
        );
    });
});

describe('ndigo generate argv (BLK-3)', () => {
    test('package forwards name/description/jobs only', () => {
        expect(generateArgv('package', { name: 'telemetry-otel', description: 'd', jobs: true })).toEqual([
            '--name',
            'telemetry-otel',
            '--description',
            'd',
            '--jobs',
        ]);
        // Schema-irrelevant flags are never forwarded (nx rejects unknowns).
        expect(generateArgv('package', { name: 'x', file: 'y' })).toEqual(['--name', 'x']);
    });

    test('component forwards the required --package (BLK-3 regression)', () => {
        expect(generateArgv('component', { name: 'widget', package: 'my-app', className: 'Widget' })).toEqual([
            '--name',
            'widget',
            '--package',
            'my-app',
            '--className',
            'Widget',
        ]);
    });

    test('header forwards the required --file (BLK-3 regression)', () => {
        expect(generateArgv('header', { file: 'packages/x/src/index.ts', force: true })).toEqual([
            '--file',
            'packages/x/src/index.ts',
            '--force',
        ]);
    });

    test('readme forwards name/description/path', () => {
        expect(generateArgv('readme', { name: 'pkg', path: 'docs/x.md' })).toEqual([
            '--name',
            'pkg',
            '--path',
            'docs/x.md',
        ]);
    });

    test('boolean flags emit bare --flag and false emits nothing', () => {
        expect(generateArgv('header', { file: 'a.ts', force: false })).toEqual(['--file', 'a.ts']);
    });
});
