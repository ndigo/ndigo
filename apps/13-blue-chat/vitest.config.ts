/**
 * Vitest lane for the `blue-chat` demo app.
 *
 * Kept separate from `vite.config.ts` so the client-build config stays
 * build-only and tests resolve `@blue/*` against `packages/<pkg>/src` through
 * the shared alias table. Vitest lowers decorators through its own esbuild
 * transform, so the `lowerDecorators()` build plugin is not needed here.
 *
 * @module blue-chat
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
