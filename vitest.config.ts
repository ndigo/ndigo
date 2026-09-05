import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            exclude: ['**/node_modules/**', '**/test/**', '**/dist/**', '**/lib/**', '**/*.spec.ts', '**/*.test.ts'],
        },
    },
    resolve: {
        // Use ordered aliases so package-root aliases don't accidentally
        // capture subpath imports like `@blue/util/types`.
        alias: [
            { find: /^@blue\/util\/date/, replacement: resolve(__dirname, './packages/blue-util/src/date') },
            { find: /^@blue\/util\/function/, replacement: resolve(__dirname, './packages/blue-util/src/function') },
            { find: /^@blue\/util\/list/, replacement: resolve(__dirname, './packages/blue-util/src/list') },
            { find: /^@blue\/util\/logic/, replacement: resolve(__dirname, './packages/blue-util/src/logic') },
            { find: /^@blue\/util\/math/, replacement: resolve(__dirname, './packages/blue-util/src/math') },
            { find: /^@blue\/util\/object/, replacement: resolve(__dirname, './packages/blue-util/src/object') },
            { find: /^@blue\/util\/relation/, replacement: resolve(__dirname, './packages/blue-util/src/relation') },
            { find: /^@blue\/util\/string/, replacement: resolve(__dirname, './packages/blue-util/src/string') },
            { find: /^@blue\/util\/types/, replacement: resolve(__dirname, './packages/blue-util/src/type') },
            { find: /^@blue\/util\/type/, replacement: resolve(__dirname, './packages/blue-util/src/type') },

            {
                find: /^@blue\/logger\/otel\/entry-to-logrecord$/,
                replacement: resolve(__dirname, './packages/blue-logger/src/otel/entry-to-logrecord'),
            },

            {
                find: /^@nx\/devkit\/testing$/,
                replacement: resolve(__dirname, './node_modules/nx/src/devkit-testing-exports'),
            },
            {
                find: /^@nx\/devkit$/,
                replacement: resolve(__dirname, './node_modules/nx/src/devkit-exports'),
            },

            { find: /^@blue\/core$/, replacement: resolve(__dirname, './packages/blue-core/src') },
            { find: /^@blue\/dom$/, replacement: resolve(__dirname, './packages/blue-dom/src') },
            { find: /^@blue\/util$/, replacement: resolve(__dirname, './packages/blue-util/src') },
            { find: /^@blue\/factory$/, replacement: resolve(__dirname, './packages/blue-factory/src') },
            { find: /^@blue\/context$/, replacement: resolve(__dirname, './packages/blue-context/src') },
            { find: /^@blue\/router$/, replacement: resolve(__dirname, './packages/blue-router/src') },
            { find: /^@blue\/view$/, replacement: resolve(__dirname, './packages/blue-view/src') },
            { find: /^@blue\/http$/, replacement: resolve(__dirname, './packages/blue-http/src') },
            { find: /^@blue\/model$/, replacement: resolve(__dirname, './packages/blue-model/src') },
            { find: /^@blue\/logger$/, replacement: resolve(__dirname, './packages/blue-logger/src') },
            { find: /^@blue\/content$/, replacement: resolve(__dirname, './packages/blue-content/src') },
            { find: /^@blue\/domain$/, replacement: resolve(__dirname, './packages/blue-domain/src') },
            { find: /^@blue\/validate$/, replacement: resolve(__dirname, './packages/blue-validate/src') },
            { find: /^@blue\/platform-web$/, replacement: resolve(__dirname, './packages/blue-platform-web/src') },
            { find: /^@blue\/platform-node$/, replacement: resolve(__dirname, './packages/blue-platform-node/src') },
            { find: /^@blue\/dispatcher$/, replacement: resolve(__dirname, './packages/blue-dispatcher/src') },
            { find: /^@blue\/boot$/, replacement: resolve(__dirname, './packages/blue-boot/src') },
            { find: /^@blue\/service$/, replacement: resolve(__dirname, './packages/blue-service/src') },
            { find: /^@blue\/eslint-plugin$/, replacement: resolve(__dirname, './packages/blue-eslint-plugin/src') },
            { find: /^@blue\/orm$/, replacement: resolve(__dirname, './packages/blue-orm/src') },
            { find: /^@blue\/auth$/, replacement: resolve(__dirname, './packages/blue-auth/src') },
            { find: /^@blue\/auth-core$/, replacement: resolve(__dirname, './packages/blue-auth-core/src') },
            { find: /^@blue\/auth-server$/, replacement: resolve(__dirname, './packages/blue-auth-server/src') },
            { find: /^@blue\/auth-client$/, replacement: resolve(__dirname, './packages/blue-auth-client/src') },
        ],
    },
});
