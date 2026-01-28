import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';
export default defineConfig({
    plugins: [
        dts({
            outDir: 'lib',
            include: ['src/**/*'],
            exclude: ['**/*.spec.ts', '**/*.test.ts', '**/test/**'],
        }),
    ],
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'boot',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`,
        },
        outDir: '.',
        emptyOutDir: false,
        sourcemap: true,
        rollupOptions: {
            external: [
                /^@blue\//,
                'reflect-metadata',
                'date-fns',
                'date-fns-tz',
                'ramda',
                'seedrandom',
                'slug',
                'objectmodel',
                /^node:.*/,
            ],
        },
        target: 'es2022',
    },
});
//# sourceMappingURL=vite.config.js.map
