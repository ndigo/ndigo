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
        alias: [
            { find: '@/lib', replacement: resolve(__dirname, './registry/base') },
            { find: /^@ndigo\/ui$/, replacement: resolve(__dirname, './src') },
        ],
    },
});
