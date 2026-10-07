import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
    resolve: {
        // Use ordered aliases so package-root aliases don't accidentally
        // capture subpath imports like `@blue/util/types`.
        alias: [
            // Live `@blue/util` subpaths only — `function`/`list`/`logic`/`object`/`relation`
            // were aspirational imports with no `src/` directory (and no manifest export).
            { find: /^@blue\/util\/crypto/, replacement: resolve(__dirname, './packages/blue-util/src/crypto') },
            { find: /^@blue\/util\/math/, replacement: resolve(__dirname, './packages/blue-util/src/math') },
            { find: /^@blue\/util\/string/, replacement: resolve(__dirname, './packages/blue-util/src/string') },
            { find: /^@blue\/util\/types/, replacement: resolve(__dirname, './packages/blue-util/src/type') },
            { find: /^@blue\/util\/type/, replacement: resolve(__dirname, './packages/blue-util/src/type') },

            { find: /^@blue\/core$/, replacement: resolve(__dirname, './packages/blue-core/src') },
            { find: /^@blue\/dom$/, replacement: resolve(__dirname, './packages/blue-dom/src') },
            { find: /^@blue\/util$/, replacement: resolve(__dirname, './packages/blue-util/src') },
            { find: /^@blue\/factory$/, replacement: resolve(__dirname, './packages/blue-factory/src') },
            { find: /^@blue\/context$/, replacement: resolve(__dirname, './packages/blue-context/src') },
            { find: /^@blue\/router$/, replacement: resolve(__dirname, './packages/blue-router/src') },
            { find: /^@blue\/host$/, replacement: resolve(__dirname, './packages/blue-host/src') },
            { find: /^@blue\/view$/, replacement: resolve(__dirname, './packages/blue-view/src') },
            { find: /^@blue\/view-ejs$/, replacement: resolve(__dirname, './packages/blue-view-ejs/src') },
            {
                find: /^@blue\/view-webcomponent$/,
                replacement: resolve(__dirname, './packages/blue-view-webcomponent/src'),
            },
            { find: /^@blue\/http$/, replacement: resolve(__dirname, './packages/blue-http/src') },
            { find: /^@blue\/content$/, replacement: resolve(__dirname, './packages/blue-content/src') },
            {
                find: /^@blue\/content-i18next$/,
                replacement: resolve(__dirname, './packages/blue-content-i18next/src'),
            },
            { find: /^@blue\/platform-web$/, replacement: resolve(__dirname, './packages/blue-platform-web/src') },
            { find: /^@blue\/platform-node$/, replacement: resolve(__dirname, './packages/blue-platform-node/src') },
            { find: /^@blue\/dispatcher$/, replacement: resolve(__dirname, './packages/blue-dispatcher/src') },
            { find: /^@blue\/boot$/, replacement: resolve(__dirname, './packages/blue-boot/src') },
            { find: /^@blue\/service$/, replacement: resolve(__dirname, './packages/blue-service/src') },
            { find: /^@blue\/scheduler$/, replacement: resolve(__dirname, './packages/blue-scheduler/src') },
            { find: /^@blue\/cache$/, replacement: resolve(__dirname, './packages/blue-cache/src') },
            { find: /^@blue\/proxy$/, replacement: resolve(__dirname, './packages/blue-proxy/src') },
            { find: /^@blue\/resilience$/, replacement: resolve(__dirname, './packages/blue-resilience/src') },
            { find: /^@blue\/redis\/cache$/, replacement: resolve(__dirname, './packages/blue-redis/src/cache') },
            { find: /^@blue\/redis\/pubsub$/, replacement: resolve(__dirname, './packages/blue-redis/src/pubsub') },
            { find: /^@blue\/redis$/, replacement: resolve(__dirname, './packages/blue-redis/src') },
            { find: /^@blue\/socket$/, replacement: resolve(__dirname, './packages/blue-socket/src') },
            { find: /^@blue\/signals$/, replacement: resolve(__dirname, './packages/blue-signals/src') },
            { find: /^@blue\/log$/, replacement: resolve(__dirname, './packages/blue-log/src') },
            { find: /^@blue\/telemetry$/, replacement: resolve(__dirname, './packages/blue-telemetry/src') },
            { find: /^@blue\/telemetry-node$/, replacement: resolve(__dirname, './packages/blue-telemetry-node/src') },
            { find: /^@blue\/telemetry-web$/, replacement: resolve(__dirname, './packages/blue-telemetry-web/src') },
            { find: /^@blue\/oxlint-plugin$/, replacement: resolve(__dirname, './packages/blue-oxlint-plugin/src') },
            { find: /^@blue\/orm$/, replacement: resolve(__dirname, './packages/blue-orm/src') },
            { find: /^@blue\/orm-drizzle$/, replacement: resolve(__dirname, './packages/blue-orm-drizzle/src') },
            { find: /^@blue\/management$/, replacement: resolve(__dirname, './packages/blue-management/src') },
            { find: /^@blue\/auth-core$/, replacement: resolve(__dirname, './packages/blue-auth-core/src') },
            { find: /^@blue\/auth-server$/, replacement: resolve(__dirname, './packages/blue-auth-server/src') },
            { find: /^@blue\/auth-client$/, replacement: resolve(__dirname, './packages/blue-auth-client/src') },
            { find: /^@blue\/openapi$/, replacement: resolve(__dirname, './packages/blue-openapi/src') },
            { find: /^@blue\/generators$/, replacement: resolve(__dirname, './packages/blue-generators/src') },
            { find: /^@blue\/test$/, replacement: resolve(__dirname, './packages/blue-test/src') },
        ],
    },
});
