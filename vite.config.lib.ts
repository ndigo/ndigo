import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

/**
 * Base Vite configuration for building BlueJS library packages.
 *
 * This config can be extended by individual packages for library builds.
 * It handles both ESM and CommonJS output with TypeScript declarations.
 */
export function createLibConfig(options: {
    packageDir: string;
    entry: string;
    name: string;
    fileName?: string;
    external?: (string | RegExp)[];
}) {
    const { packageDir, entry, name, fileName, external = [] } = options;

    // Common external dependencies for all @blue packages
    const defaultExternal = [
        /^@blue\//, // All @blue/* packages
        'reflect-metadata',
        'date-fns',
        'date-fns-tz',
        'ramda',
        'seedrandom',
        'slug',
        /^node:.*/, // Node built-ins
    ];

    return defineConfig({
        plugins: [
            dts({
                outDir: resolve(packageDir, 'lib'),
                include: ['src/**/*'],
                exclude: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
                rollupTypes: true,
            }),
        ],
        build: {
            lib: {
                entry: resolve(packageDir, entry),
                name: name,
                fileName: fileName || ((format) => `index.${format === 'es' ? 'js' : 'cjs'}`),
                formats: ['es', 'cjs'],
            },
            outDir: resolve(packageDir, 'lib'),
            emptyOutDir: true,
            sourcemap: true,
            rollupOptions: {
                external: [...defaultExternal, ...external],
                output: {
                    preserveModules: true,
                    preserveModulesRoot: 'src',
                    exports: 'named',
                    // ESM output
                    entryFileNames: (chunkInfo) => {
                        if (chunkInfo.name === 'index') {
                            return 'index.js';
                        }
                        return '[name].js';
                    },
                    // Ensure proper file structure
                    chunkFileNames: '[name].js',
                },
            },
            minify: false, // Don't minify library code
            target: 'es2022',
        },
        resolve: {
            alias: {
                '@blue/core': resolve(__dirname, './packages/blue-core/src'),
                '@blue/util': resolve(__dirname, './packages/blue-util/src'),
                '@blue/context': resolve(__dirname, './packages/blue-context/src'),
                '@blue/factory': resolve(__dirname, './packages/blue-factory/src'),
                '@blue/router': resolve(__dirname, './packages/blue-router/src'),
                '@blue/view': resolve(__dirname, './packages/blue-view/src'),
                '@blue/http': resolve(__dirname, './packages/blue-http/src'),
                '@blue/telemetry': resolve(__dirname, './packages/blue-telemetry/src'),
                '@blue/content': resolve(__dirname, './packages/blue-content/src'),
                '@blue/domain': resolve(__dirname, './packages/blue-domain/src'),
                '@blue/platform-web': resolve(__dirname, './packages/blue-platform-web/src'),
                '@blue/dispatcher': resolve(__dirname, './packages/blue-dispatcher/src'),
                '@blue/boot': resolve(__dirname, './packages/blue-boot/src'),
                '@blue/service': resolve(__dirname, './packages/blue-service/src'),
            },
        },
    });
}

export default defineConfig({
    // Root level config if needed
});
