/**
 * Vitest lane for the agent lab: Node environment and the shared `@ndigo/*`
 * source aliases.
 */
import { defineConfig } from 'vitest/config';
import { lowerDecorators } from '../../scripts/vite-plugin-lower-decorators.mjs';
import { ndigoAliases } from '../../vitest.aliases';

export default defineConfig({
    // App sources carry `@configuration`/`@entry`/`@toolMapping`; Vite 8's Oxc
    // pipeline passes TC39 decorators through, so lower them here like the
    // root config does.
    plugins: [lowerDecorators()],
    resolve: {
        alias: ndigoAliases,
    },
    test: {
        environment: 'node',
        include: ['test/**/*.{test,spec}.ts'],
        exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
    },
});
