import { defineConfig } from 'vitest/config';
import { resolve } from 'node:path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
    resolve: {
        // Subpaths first: a bare `@ndigo/util` string alias would otherwise
        // capture `@ndigo/util/types` and resolve it to a non-existent `src/types`.
        alias: [
            { find: /^@ndigo\/util\/crypto/, replacement: resolve(__dirname, './src/crypto') },
            { find: /^@ndigo\/util\/string/, replacement: resolve(__dirname, './src/string') },
            { find: /^@ndigo\/util\/types/, replacement: resolve(__dirname, './src/type') },
            { find: /^@ndigo\/util\/type/, replacement: resolve(__dirname, './src/type') },
            { find: /^@ndigo\/util$/, replacement: resolve(__dirname, './src') },
        ],
    },
});
