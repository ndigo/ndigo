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
    },
    resolve: {
        // Workspace packages resolve through vite's node resolution (pnpm
        // symlinks); no extra aliases needed.
    },
});