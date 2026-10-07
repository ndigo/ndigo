/**
 * Vitest config for the oxlint plugin's own rule specs.
 *
 * Reuses the shared `@blue/*` → `packages/<pkg>/src` alias table so the parity
 * specs resolve the runtime helpers (`@blue/view`, `@blue/dispatcher`) against
 * live sources rather than built `lib/` output — whether the lane is run from
 * the repo root or via `pnpm --filter @blue/oxlint-plugin test`.
 *
 * @module blue-oxlint-plugin
 * @since 1.0.0
 * @author Jeff Rose
 */
import { defineConfig } from 'vitest/config';
import { blueAliases } from '../../vitest.aliases';

export default defineConfig({
    test: {
        setupFiles: ['./test/_setup.ts'],
    },
    resolve: {
        alias: blueAliases,
    },
});
