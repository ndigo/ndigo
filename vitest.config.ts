import { defineConfig } from 'vitest/config';
import { lowerDecorators } from './scripts/vite-plugin-lower-decorators.mjs';
import { ndigoAliases } from './vitest.aliases';

export default defineConfig({
    // Vitest 5 transforms through Vite 8's Oxc pipeline, which passes TC39
    // decorators through unchanged (Vitest 4 ran its own esbuild transform,
    // which lowered them) — so the decorator policy (HI-1) now covers tests
    // too: workspace `.ts` sources with `@decorator` must be lowered here.
    plugins: [lowerDecorators()],
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: [],
        include: ['**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**', '**/e2e/**'],
    },
    resolve: {
        // Shared with every app config (`vitest.aliases.ts`); ordered so
        // package-root aliases don't accidentally capture subpath imports
        // like `@ndigo/util/types`.
        alias: ndigoAliases,
    },
});
