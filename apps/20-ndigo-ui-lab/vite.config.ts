import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';

const src = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
    plugins: [lowerDecorators()],
    resolve: {
        // The registry-installed elements import `@/lib/...`; the alias is the
        // consumer-side half of the copy-in contract.
        alias: [{ find: /^@\//u, replacement: `${src}/` }],
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
        minify: false,
    },
    server: {
        port: 3460,
    },
});
