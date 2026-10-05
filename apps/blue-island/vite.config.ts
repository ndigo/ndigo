import { defineConfig } from 'vite';

/**
 * Builds the client half of the island demo into `dist/` (a single module
 * bundle named `client.js`), which the Node server serves under `/static/`.
 */
export default defineConfig({
    build: {
        outDir: 'dist',
        lib: {
            entry: 'client/main.ts',
            name: 'blueIslandClient',
            formats: ['es'],
            fileName: 'client',
        },
        copyPublicDir: false,
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
    resolve: {
        // Workspace packages resolve through vite's node resolution (pnpm
        // symlinks); no extra aliases needed.
    },
});
