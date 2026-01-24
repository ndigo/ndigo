import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
    resolve: {
        alias: {
            '@blue/core': resolve(__dirname, '../blue-core/src'),
            '@blue/util': resolve(__dirname, '../blue-util/src'),
            '@blue/parser': resolve(__dirname, '../blue-parser/src'),
        },
    },
});
