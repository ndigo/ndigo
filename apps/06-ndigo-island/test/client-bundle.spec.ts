/**
 * @module ndigo-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

/**
 * Regression guard for the decorator-lowering failure (2026-10-06): Vite 8's
 * oxc transform passes `@decorator` syntax through, so decorator-using client
 * bundles shipped as invalid JavaScript while jsdom/Vitest suites stayed
 * green (Vitest transforms through esbuild). `scripts/vite-plugin-lower-
 * decorators.mjs` lowers them; parsing the built bundle with `node --check` as
 * an ES module fails loudly if that ever regresses. The `test` script builds
 * the client first, and the bundle path is anchored to this file rather than
 * the process cwd.
 */
const bundle = resolve(import.meta.dirname, '..', 'dist', 'client.js');
const scratch = mkdtempSync(join(tmpdir(), 'ndigo-island-bundle-check-'));

/**
 * Copies `source` to a throwaway `.mjs` under the scratch dir and syntax-checks
 * it with Node as an ES module (classic-script grammar would spuriously reject
 * legitimate `export`/`import.meta`).
 *
 * @param name - Identifier for the scratch file.
 * @param source - Module source text.
 * @returns The `spawnSync` result for `node --check`.
 */
function checkAsModule(name: string, source: string) {
    const file = join(scratch, `${name}.mjs`);
    writeFileSync(file, source);
    return spawnSync(process.execPath, ['--check', file], { encoding: 'utf-8' });
}

afterAll(() => {
    rmSync(scratch, { recursive: true, force: true });
});

describe('ndigo-island client bundle', () => {
    test('is valid JavaScript (TC39 decorators lowered for browsers)', () => {
        const result = checkAsModule('client', readFileSync(bundle, 'utf-8'));
        expect(result.status, result.stderr).toBe(0);
    });

    test('rejects raw TC39 decorator syntax (guard is effective)', () => {
        const result = checkAsModule('raw-decorator', "@getCall('/x')\nclass Demo {}\n");
        expect(result.status).not.toBe(0);
    });
});
