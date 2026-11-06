/**
 * Builds the client half of the chat demo into `dist/` (a single module
 * bundle named `client.js` plus `client.css`), which the Node server serves
 * under `/static/`.
 */
import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

export default defineConfig({
    // TC39 decorators (`@TagMapping`) must be lowered for browsers; Vite 8's
    // oxc transform passes them through unchanged.
    plugins: [lowerDecorators()],
    build: {
        outDir: 'dist',
        lib: {
            entry: 'client/main.ts',
            name: 'ndigoChatClient',
            formats: ['es'],
            fileName: 'client',
        },
        copyPublicDir: false,
        // Name-bound parameter resolution (@ndigo/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified.
        minify: false,
    },
});
