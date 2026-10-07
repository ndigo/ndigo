/**
 * @module blue-island
 * @since 1.0.0
 * @author Jeff Rose
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { Script } from 'node:vm';
import { describe, expect, test } from 'vitest';

/**
 * Regression guard for the decorator-lowering failure (2026-10-06): Vite 8's
 * oxc transform passes `@decorator` syntax through, so decorator-using client
 * bundles shipped as invalid JavaScript while jsdom/Vitest suites stayed
 * green (Vitest transforms through esbuild). `scripts/vite-plugin-lower-
 * decorators.mjs` lowers them; parsing the built bundle with `node:vm` fails
 * loudly if that ever regresses. The `test` script builds the client first.
 */
describe('blue-island client bundle', () => {
    test('is valid JavaScript (TC39 decorators lowered for browsers)', () => {
        const bundle = resolve('dist/client.js');
        const source = readFileSync(bundle, 'utf-8');
        expect(() => new Script(source, { filename: bundle })).not.toThrow();
    });
});
