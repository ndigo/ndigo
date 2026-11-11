import { defineConfig } from 'vitest/config';
import { lowerDecorators } from './scripts/vite-plugin-lower-decorators.mjs';
import { ndigoAliases } from './vitest.aliases';

/**
 * Benchmark lane configuration.
 *
 * Kept separate from `vitest.config.ts` because benchmarks need the opposite
 * defaults from tests: the Node environment (no jsdom globals), one worker,
 * no file parallelism, and no shuffled order. A benchmark that needs DOM
 * globals opts in with a `// @vitest-environment jsdom` docblock.
 */
export default defineConfig({
    plugins: [lowerDecorators()],
    test: {
        globals: true,
        environment: 'node',
        fileParallelism: false,
        maxWorkers: 1,
        sequence: { shuffle: false },
        benchmark: {
            include: ['packages/*/bench/**/*.bench.ts', 'benchmarks/**/*.bench.ts'],
            exclude: ['**/node_modules/**', '**/dist/**', '**/lib/**', '**/coverage/**'],
        },
    },
    resolve: {
        alias: ndigoAliases,
    },
});
