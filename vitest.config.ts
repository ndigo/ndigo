import { defineConfig } from 'vitest/config';
import { ndigoAliases } from './vitest.aliases';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
    resolve: {
        // Shared with every app config (`vitest.aliases.ts`); ordered so
        // package-root aliases don't accidentally capture subpath imports
        // like `@ndigo/util/types`.
        alias: ndigoAliases,
    },
});
