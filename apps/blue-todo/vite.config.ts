import { defineConfig } from 'vitest/config';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

export default defineConfig(({ command }) => ({
    root: '.',
    // TC39 decorators (`@signal`/`@effect`) must be lowered for browsers;
    // Vite 8's oxc transform passes them through unchanged (2026-10-06).
    // Build only: Vitest transforms through esbuild, which already lowers them.
    plugins: command === 'build' ? [lowerDecorators()] : [],
    test: {
        // Unit/integration suite only: Playwright specs in e2e/ are run by
        // the Playwright runner, not vitest (mirrors root vitest.config.ts).
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
        // Name-bound parameter resolution (@blue/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified (2026-10-04, e2e pre-existing failure).
        minify: false,
    },
    server: {
        port: 3000,
    },
}));
