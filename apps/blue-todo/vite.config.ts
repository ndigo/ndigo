import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: '.',
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
    // TC39 decorators must be lowered: esbuild passes them through and
    // browsers cannot parse `@decorator class` — vitest 4 already uses oxc.
    oxc: {
        tsconfigRaw: {
            compilerOptions: {
                target: 'ES2022',
                experimentalDecorators: false,
            },
        },
    },
    server: {
        port: 3000,
    },
});
