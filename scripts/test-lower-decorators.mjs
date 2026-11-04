/**
 * Root-tooling lane for `vite-plugin-lower-decorators.mjs` (SEC-B/WC-I).
 *
 * Runs under `pnpm test:tooling` (`node --test scripts/test-lower-decorators.mjs`
 * — no vitest, no nx): the plugin's probes previously lived in `/tmp` and
 * died with the session, so the `.cts`-coverage and pre-check regressions
 * had no durable home. The plugin is a pure `lowerDecorators()` factory —
 * its `transform(code, id)` is exercised directly here, exactly as Vite
 * would call it. The name deliberately escapes vitest's `*.test.*` glob:
 * node:test files must never be collected by a root `vitest run`.
 *
 * Coverage pinned: extension scope (`.ts`/`.mts`/`.cts`/`.tsx` in,
 * `.js`/`.svelte` out), the node_modules/workspace-package rule, the
 * `/^\s*@|[{(;]\s*@/m` pre-check (decorator-free and string-literal-only
 * modules pass through untouched), and the lowered output (raw decorator
 * syntax gone, sourcemap attached).
 * @module scripts/vite-plugin-lower-decorators.test
 * @since 1.0.0
 * @author Jeff Rose
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lowerDecorators } from './vite-plugin-lower-decorators.mjs';

const plugin = lowerDecorators();

const DECORATED = `@routeMapping('/api')
class HelloController {
    @service()
    hello() {
        return 'hi';
    }
}
`;

const DECORATOR_FREE = `export function plain(): string {
    return 'no decorators here';
}
`;

const AT_IN_STRING = `export const email = 'dev@example.com';
const regex = /\\@not-a-decorator/m;
`;

void test('lowers standard decorators in .ts modules', async () => {
    const out = await plugin.transform(DECORATED, '/repo/apps/demo/src/controller.ts');
    assert.notEqual(out, null);
    assert.ok(!/^\s*@\w+/m.test(out.code), 'raw decorator syntax must be lowered');
    assert.ok(out.code.includes('class HelloController'), 'class itself survives');
    assert.ok(out.map !== null, 'a sourcemap is attached');
});

void test('covers every documented extension: .mts, .cts, .tsx', async () => {
    const results = await Promise.all(
        ['.mts', '.cts', '.tsx'].map(async (ext) => [
            ext,
            await plugin.transform(DECORATED, `/repo/apps/demo/src/controller${ext}`),
        ])
    );
    for (const [ext, out] of results) {
        assert.notEqual(out, null, `${ext} must be transformed`);
        assert.ok(!/^\s*@\w+/m.test(out.code), `${ext} output must be lowered (SEC-B)`);
    }
});

void test('leaves non-TypeScript modules untouched', async () => {
    const results = await Promise.all(
        ['/repo/apps/demo/src/theme.css', '/repo/apps/demo/src/svelte-component.js'].map(async (id) => [
            id,
            await plugin.transform(DECORATED, id),
        ])
    );
    for (const [id, out] of results) {
        assert.equal(out, null, `${id} must be out of scope`);
    }
});

void test('does not re-transform decorator-free modules (pre-check, WC-I)', async () => {
    assert.equal(await plugin.transform(DECORATOR_FREE, '/repo/apps/demo/src/plain.ts'), null);
    // An `@` inside a string or a regex is not a decorator position.
    assert.equal(await plugin.transform(AT_IN_STRING, '/repo/apps/demo/src/strings.ts'), null);
});

void test('excludes bundled third-party modules but keeps workspace packages', async () => {
    const vendored = await plugin.transform(DECORATED, '/repo/node_modules/@awesome.me/lib/dist/widget.ts');
    assert.equal(vendored, null, 'non-workspace node_modules stays browser-ready as-is');
    const workspace = await plugin.transform(DECORATED, '/repo/packages/ndigo-view-webcomponent/src/island.ts');
    assert.notEqual(workspace, null, 'workspace package sources are lowered');
});
