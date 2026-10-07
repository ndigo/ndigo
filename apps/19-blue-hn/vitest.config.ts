/**
 * Vitest lane for the `@blue/hn` demo app.
 *
 * Kept separate from `vite.config.ts` so the build/dev config stays build-only
 * and tests resolve `@blue/*` against `packages/<pkg>/src` through the shared alias
 * table (HI-6/TST-B) instead of whatever the nearest Vite config happened to do.
 *
 * @module blue-hn
 * @since 1.0.0
 * @author Jeff Rose
 */
import { defineConfig } from 'vitest/config';
import { blueAliases } from '../../vitest.aliases';

export default defineConfig({
    resolve: {
        alias: blueAliases,
    },
    test: {
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
});
