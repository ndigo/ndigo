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
        // Subpaths first: a bare `@blue/util` string alias would otherwise
        // capture `@blue/util/types` and resolve it to a non-existent `src/types`.
        alias: [
            { find: /^@blue\/util\/crypto/, replacement: resolve(__dirname, './src/crypto') },
            { find: /^@blue\/util\/string/, replacement: resolve(__dirname, './src/string') },
            { find: /^@blue\/util\/types/, replacement: resolve(__dirname, './src/type') },
            { find: /^@blue\/util\/type/, replacement: resolve(__dirname, './src/type') },
            { find: /^@blue\/util$/, replacement: resolve(__dirname, './src') },
        ],
    },
});
