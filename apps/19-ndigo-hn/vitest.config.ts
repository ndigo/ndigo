/**
 * Vitest lane for the `@ndigo/hn` demo app.
 *
 * Kept separate from `vite.config.ts` so the build/dev config stays build-only
 * and tests resolve `@ndigo/*` against `packages/<pkg>/src` through the shared alias
 * table (HI-6/TST-B) instead of whatever the nearest Vite config happened to do.
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
