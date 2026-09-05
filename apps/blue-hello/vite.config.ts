import { defineConfig } from 'vite';

export default defineConfig({
    root: '.',
    build: {
        outDir: 'dist',
        sourcemap: true,
        target: 'es2022',
    },
    esbuild: {
        target: 'es2022',
        tsconfigRaw: {
            compilerOptions: {
                target: 'ES2022',
                experimentalDecorators: false,
            },
        },
    },
    server: {
        port: 3001,
    },
});
