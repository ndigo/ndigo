import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
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
        port: 3005,
    },
});
