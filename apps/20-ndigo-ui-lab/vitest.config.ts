/**
 * Vitest lane for the UI lab: jsdom, the app-local `@/` alias, and the shared
 * `@ndigo/*` source aliases.
 */
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { ndigoAliases } from '../../vitest.aliases';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
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
