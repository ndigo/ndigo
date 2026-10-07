/**
 * Builds the client half of the chat demo into `dist/` (a single module
 * bundle named `client.js` plus `client.css`), which the Node server serves
 * under `/static/`.
 *
 * @module blue-chat
 * @since 1.0.0
 * @author Jeff Rose
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
            name: 'blueChatClient',
            formats: ['es'],
            fileName: 'client',
        },
        copyPublicDir: false,
        // Name-bound parameter resolution (@blue/dispatcher parses function
        // signatures) breaks under identifier-minifying builds — demo apps
        // must stay unminified.
        minify: false,
    },
});
