/**
 * Builds the playground's browser client into `dist/` (a single ES module named
 * `client.js`), which the Node server serves under `/static/`.
 *
 * `vite dev` serves the same entry on port 3440 with every API path proxied to
 * the playground server, so the dev page is same-origin and the session cookie
 * behaves exactly as it does in the built page.
 */
import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

/** The playground server the dev client talks to (see `src/config.ts`). */
const SERVER_TARGET = process.env.AUTH_PLAYGROUND_TARGET ?? 'http://127.0.0.1:3110';

/** API path prefixes the dev server proxies to the Node server. */
const API_PREFIXES = ['/auth', '/jwt', '/roles', '/oidc', '/static', '/health'];

export default defineConfig({
    root: 'client',
    // TC39 decorators (`@service`/`@getCall`) must be lowered for browsers;
    // Vite 8's oxc transform passes them through unchanged (2026-10-06).
    plugins: [lowerDecorators()],
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
        target: 'es2022',
        lib: {
            entry: 'main.ts',
            name: 'blueAuthPlaygroundClient',
            formats: ['es'],
            fileName: 'client',
        },
        copyPublicDir: false,
        // Name-bound parameter resolution (@blue/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified (2026-10-04, e2e pre-existing failure).
        minify: false,
    },
    server: {
        port: 3440,
        // Dev-only same-origin bridge: the browser calls `/auth/*`, `/jwt/*`
        // and friends on its own origin, so there is no CORS preflight and the
        // `__Host-`/`SameSite` session cookie is exercised on the real wire.
        proxy: Object.fromEntries(
            API_PREFIXES.map((prefix) => [prefix, { target: SERVER_TARGET, changeOrigin: true }])
        ),
    },
    preview: {
        port: 3440,
    },
});
