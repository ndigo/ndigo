/**
 * @module blue-conduit-web
 * @since 1.0.0
 * @author Jeff Rose
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';

/**
 * Regression guard for HI-1: a bundle that still contains raw TC39 decorators
 * is invalid JavaScript and `node --check` rejects it with
 * `SyntaxError: Invalid or unexpected token` — yet the jsdom/Vitest suite
 * stays green because Vitest lowers decorators itself. Every emitted
 * `dist/**` `*.js` asset is therefore parsed here as an ES module (copied to a
 * temp `.mjs`, since classic-script grammar would spuriously reject legitimate
 * `export`/`import.meta`), so dropping the `lowerDecorators()` plugin fails
 * loudly. The app `test` script runs `vite build` first.
 */
const distDir = resolve(import.meta.dirname, '..', 'dist');
const bundles = readdirSync(distDir, { recursive: true, encoding: 'utf-8' }).filter((entry) => entry.endsWith('.js'));

const scratch = mkdtempSync(join(tmpdir(), 'blue-bundle-check-'));

/**
 * Copies `source` to a throwaway `.mjs` under the scratch dir and syntax-checks
 * it with Node as an ES module.
 *
 * @param name - Identifier for the scratch file (kept unique per asset).
 * @param source - Module source text.
 * @returns The `spawnSync` result for `node --check`.
 */
function checkAsModule(name, source) {
    const file = join(scratch, `${name}.mjs`);
    writeFileSync(file, source);
    return spawnSync(process.execPath, ['--check', file], { encoding: 'utf-8' });
}

afterAll(() => {
    rmSync(scratch, { recursive: true, force: true });
});

describe('blue-conduit-web bundle', () => {
    test('emits at least one JavaScript asset', () => {
        expect(bundles.length).toBeGreaterThan(0);
    });

    test.each(bundles)('parses as an ES module: %s', (entry) => {
        const source = readFileSync(join(distDir, entry), 'utf-8');
        const result = checkAsModule(entry.replaceAll('/', '_'), source);
        expect(result.status, result.stderr).toBe(0);
    });

    test('rejects raw TC39 decorator syntax (guard is effective)', () => {
        const result = checkAsModule('raw-decorator', "@routeMapping('/')\nclass Demo {}\n");
        expect(result.status).not.toBe(0);
    });
});
