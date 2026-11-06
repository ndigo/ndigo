/**
 * Vitest lane for the `@ndigo/resilience-lab` demo app.
 *
 * Kept separate from any build config so tests resolve `@ndigo/*` against
 * `packages/<pkg>/src` through the shared alias table (HI-6/TST-B) instead of
 * the built `lib/` output the `node_modules` symlinks expose — mirrors the
 * sibling Node app lanes (`09-ndigo-httpbin`, `04-ndigo-todo-api`).
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { defineConfig } from 'vitest/config';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';
import { ndigoAliases } from '../../vitest.aliases';

export default defineConfig({
    // Oxc (Vite 8) leaves TC39 decorators untouched, so tests lower them with
    // the same plugin `vite build` uses (HI-1).
    plugins: [lowerDecorators()],
    resolve: {
        alias: ndigoAliases,
    },
    test: {
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
});
