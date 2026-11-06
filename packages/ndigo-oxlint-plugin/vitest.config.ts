/**
 * Vitest config for the oxlint plugin's own rule specs.
 *
 * Reuses the shared `@ndigo/*` → `packages/<pkg>/src` alias table so the parity
 * specs resolve the runtime helpers (`@ndigo/view`, `@ndigo/dispatcher`) against
 * live sources rather than built `lib/` output — whether the lane is run from
 * the repo root or via `pnpm --filter @ndigo/oxlint-plugin test`.
 */
import { defineConfig } from 'vitest/config';
import { ndigoAliases } from '../../vitest.aliases';

export default defineConfig({
    test: {
        setupFiles: ['./test/_setup.ts'],
    },
    resolve: {
        alias: ndigoAliases,
    },
});
