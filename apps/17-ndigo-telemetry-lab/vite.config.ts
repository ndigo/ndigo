/**
 * Builds the browser half of the telemetry lab into `dist/` (a single module
 * bundle named `client.js`), which the Node server serves under `/static/`.
 *
 * @module ndigo-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

export default defineConfig({
    // TC39 decorators (`@service`/`@getCall`) must be lowered for browsers;
    // Vite 8's oxc transform passes them through unchanged (2026-10-06).
    plugins: [lowerDecorators()],
    build: {
        outDir: 'dist',
        lib: {
            entry: 'client/main.ts',
            name: 'ndigoTelemetryLabClient',
            formats: ['es'],
            fileName: 'client',
        },
        copyPublicDir: false,
        // Name-bound parameter resolution (@ndigo/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified (2026-10-04, e2e pre-existing failure).
        minify: false,
    },
    // Workspace packages resolve through vite's node resolution (pnpm
    // symlinks); no extra aliases needed.
});
