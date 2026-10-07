/**
 * Vitest lane for the `@blue/httpbin` demo app.
 *
 * Kept separate from any build config so tests resolve `@blue/*` against
 * `packages/<pkg>/src` through the shared alias table (HI-6/TST-B) instead of
 * the built `lib/` output the `node_modules` symlinks expose — mirrors the
 * sibling Node app lanes (`04-blue-api` relies on the root lane; this app
 * declares its own).
 *
 * @module blue-httpbin
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
