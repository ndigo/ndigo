import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

export default defineConfig({
    root: '.',
    // Decorator policy (HI-1): every app with browser sources lowers TC39
    // decorators with this plugin for BOTH `vite build` and `vite dev` —
    // Vite 8's oxc transform passes `@decorator` syntax through unchanged, so
    // any path that skips it (build bundle or dev-served module) ships
    // JavaScript browsers cannot parse. The app `vitest.config.ts` carries the
    // same plugin, because Vitest 5 transforms through this very Vite pipeline.
    plugins: [lowerDecorators()],
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
        // Name-bound parameter resolution (@ndigo/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified (2026-10-04, e2e pre-existing failure).
        minify: false,
    },
    server: {
        port: 3003,
    },
});
