/**
 * Vitest lane for the `@ndigo/resilience-lab` demo app.
 *
 * Kept separate from any build config so tests resolve `@ndigo/*` against
 * `packages/<pkg>/src` through the shared alias table (HI-6/TST-B) instead of
 * the built `lib/` output the `node_modules` symlinks expose — mirrors the
 * sibling Node app lanes (`08-ndigo-httpbin`, `09-ndigo-todobackend`).
 *
 * @module ndigo-resilience-lab
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
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
});
