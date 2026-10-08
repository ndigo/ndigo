/**
 * Helper unit specs (AD-75): directory resolution, script discovery, and
 * the pnpm argv the CLI runs — the command/process plumbing in isolation.
 * @module blue-cli
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { appScriptCommand, readAppManifest, resolveAppDir } from '../src/helpers/app-scripts.js';

let fixture: string;

beforeAll(() => {
    fixture = join('/tmp', `blue-cli-helpers-${process.pid}`);
    mkdirSync(fixture, { recursive: true });
    writeFileSync(
        join(fixture, 'package.json'),
        JSON.stringify({ name: 'a', scripts: { start: 'tsx src/index.ts', inspect: 'tsx src/inspect.ts' } })
    );
});

describe('app-scripts helpers', () => {
    test('resolveAppDir resolves relative dirs and rejects non-app directories', () => {
        expect(resolveAppDir(fixture)).toBe(fixture);
        expect(resolveAppDir('.').endsWith('/packages/blue-cli')).toBe(true);
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

    test('appScriptCommand fails loud with the hint when the script is missing', () => {
        expect(() => appScriptCommand(fixture, 'db:migrate', 'add a db:migrate script')).toThrow(
            /no "db:migrate" script.*add a db:migrate script/
        );
    });
});
