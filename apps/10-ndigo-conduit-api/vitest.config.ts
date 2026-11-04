/**
 * Vitest lane for the `ndigo-conduit-api` RealWorld app.
 *
 * The `@ndigo/*` aliases come from the shared table so the suite resolves the
 * live `packages/<pkg>/src` sources instead of the built `lib/` output.
 *
 * @module ndigo-conduit-api
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
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
});
