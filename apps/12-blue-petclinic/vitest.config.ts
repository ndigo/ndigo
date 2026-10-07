/**
 * Vitest lane for the `blue-petclinic` app.
 *
 * The `@blue/*` aliases come from the shared table so the suite resolves the
 * live `packages/<pkg>/src` sources instead of the built `lib/` output.
 *
 * @module blue-petclinic
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
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
});
