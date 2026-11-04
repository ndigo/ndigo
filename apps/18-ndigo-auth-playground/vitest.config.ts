/**
 * Vitest lane for the `@ndigo/auth-playground` demo app.
 *
 * Kept separate from `vite.config.ts` so the client-build config stays
 * build-only and tests resolve `@ndigo/*` against `packages/<pkg>/src` through
 * the shared alias table (HI-6/TST-B) instead of a stale built `lib/` — mirrors
 * the sibling Node app lanes (`04-ndigo-api`, `08-ndigo-httpbin`).
 *
 * Timeouts are raised over the Vitest default because the playground boots the
 * production password encoder (scrypt `ln=17`, ~300 ms per hash/verify): one
 * boot hashes the demo accounts once, and each login verifies once.
 *
 * @module ndigo-auth-playground
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
        testTimeout: 30_000,
        hookTimeout: 30_000,
    },
});
