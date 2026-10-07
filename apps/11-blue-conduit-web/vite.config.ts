import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

export default defineConfig({
    root: '.',
    // Decorator policy (HI-1): every app with browser sources lowers TC39
    // decorators with this plugin for BOTH `vite build` and `vite dev` —
    // Vite 8's oxc transform passes `@decorator` syntax through unchanged, so
    // any path that skips it (build bundle or dev-served module) ships
    // JavaScript browsers cannot parse. Vitest needs no plugin: its own esbuild
    // transform already lowers decorators, and the app `vitest.config.ts` only
    // supplies the shared `@blue/*` aliases.
    plugins: [lowerDecorators()],
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
        port: 3400,
        // Dev-only same-origin bridge to the local RealWorld API
        // (`apps/10-blue-conduit-api`, port 3040): the browser app calls
        // `/api/*` on its own origin, so there is no CORS preflight and the
        // JWT never crosses an origin boundary. Point `target` at any other
        // RealWorld-compatible backend to run this app against it — see the
        // README's "Pointing at another API".
        proxy: {
            '/api': {
                target: process.env.CONDUIT_API_TARGET ?? 'http://127.0.0.1:3040',
                changeOrigin: true,
            },
        },
    },
    preview: {
        port: 3400,
    },
});
