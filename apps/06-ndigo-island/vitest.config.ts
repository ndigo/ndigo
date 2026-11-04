/**
 * Vitest lane for the `ndigo-island` demo app.
 *
 * Kept separate from `vite.config.ts` so the client-build config stays
 * build-only and tests resolve `@ndigo/*` against `packages/<pkg>/src` through the
 * shared alias table (HI-6/TST-B). Vitest lowers decorators through its own
 * esbuild transform, so the `lowerDecorators()` build plugin is not needed here.
 *
 * @module ndigo-island
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
