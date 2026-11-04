/**
 * Vitest lane for the `@ndigo/todo` demo app.
 *
 * Kept separate from `vite.config.ts` so the build/dev config stays build-only
 * and tests resolve `@ndigo/*` against `packages/<pkg>/src` through the shared alias
 * table (HI-6/TST-B) instead of whatever the nearest Vite config happened to
 * do. The `test` block (include/exclude) moved here verbatim from the old
 * in-`vite.config.ts` block.
 *
 * @module ndigo-todo
 * @since 1.0.0
 * @author Jeff Rose
 */
import { defineConfig } from 'vitest/config';
import { ndigoAliases } from '../../vitest.aliases';

export default defineConfig({
    resolve: {
        alias: ndigoAliases,
    },
    test: {
        // Unit/integration suite only: Playwright specs in e2e/ are run by
        // the Playwright runner, not vitest (mirrors root vitest.config.ts).
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
});
