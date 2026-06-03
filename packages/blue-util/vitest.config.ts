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
            '@blue/util': resolve(__dirname, './src'),
            // Also create aliases for deep imports
            '@blue/util/string': resolve(__dirname, './src/string'),
            '@blue/util/type': resolve(__dirname, './src/type'),
            '@blue/util/types': resolve(__dirname, './src/type'),
            '@blue/util/math': resolve(__dirname, './src/math'),
        },
    },
});
