import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/test/**', '**/dist/**', '**/lib/**', '**/*.spec.ts', '**/*.test.ts'],
        },
    },
    resolve: {
        alias: {
            '@blue/core': resolve(__dirname, './packages/blue-core/src'),
            '@blue/util': resolve(__dirname, './packages/blue-util/src'),
            '@blue/parser': resolve(__dirname, './packages/blue-parser/src'),
            '@blue/context': resolve(__dirname, './packages/blue-context/src'),
            '@blue/factory': resolve(__dirname, './packages/blue-factory/src'),
            '@blue/router': resolve(__dirname, './packages/blue-router/src'),
            '@blue/view': resolve(__dirname, './packages/blue-view/src'),
            '@blue/http': resolve(__dirname, './packages/blue-http/src'),
            '@blue/model': resolve(__dirname, './packages/blue-model/src'),
            '@blue/logger': resolve(__dirname, './packages/blue-logger/src'),
            '@blue/content': resolve(__dirname, './packages/blue-content/src'),
            '@blue/domain': resolve(__dirname, './packages/blue-domain/src'),
            '@blue/validate': resolve(__dirname, './packages/blue-validate/src'),
            '@blue/fill': resolve(__dirname, './packages/blue-fill/src'),
            '@blue/has': resolve(__dirname, './packages/blue-has/src'),
            '@blue/print': resolve(__dirname, './packages/blue-print/src'),
            '@blue/platform-web': resolve(__dirname, './packages/blue-platform-web/src'),
            '@blue/dispatcher': resolve(__dirname, './packages/blue-dispatcher/src'),
            '@blue/boot': resolve(__dirname, './packages/blue-boot/src'),
            '@blue/service': resolve(__dirname, './packages/blue-service/src'),
        },
    },
});
