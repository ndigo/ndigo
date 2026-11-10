/**
 * Vitest lane for the UI lab: jsdom, the app-local `@/` alias, and the shared
 * `@ndigo/*` source aliases.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';
import { ndigoAliases } from '../../vitest.aliases';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
    // The WebMCP demo carries `@parameters`; Vite 8's Oxc pipeline passes TC39
    // decorators through, so lower them here like the root config does.
    plugins: [lowerDecorators()],
    resolve: {
        // The app-local `@/` alias must win over the package registry alias in
        // `ndigoAliases`, so it comes first.
        alias: [{ find: /^@\//u, replacement: `${src}/` }, ...ndigoAliases],
    },
    test: {
        environment: 'jsdom',
        include: ['test/**/*.{test,spec}.{ts,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
});
