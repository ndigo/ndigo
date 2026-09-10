import { defineConfig } from 'vitest/config';

export default defineConfig({
    root: '.',
    test: {
        // Unit/integration suite only: Playwright specs in e2e/ are run by
        // the Playwright runner, not vitest (mirrors root vitest.config.ts).
        include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
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
        port: 3000,
    },
});
