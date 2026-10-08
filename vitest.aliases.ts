/**
 * Shared Vitest resolve-alias table for `@blue/*` workspace packages.
 *
 * Both the root `vitest.config.ts` and every app `vitest.config.ts` import this
 * table, so tests resolve `@blue/*` against the live `packages/<pkg>/src` sources
 * rather than the built `lib/` output that the `node_modules` symlinks expose.
 * A source-only change is therefore exercised without a rebuild, and a missing
 * `lib/` can no longer break a lane (HI-6/TST-B).
 *
 * The aliases are ordered: package-root entries must not capture subpath
 * imports such as `@blue/util/types`, so the more specific subpaths come first.
 *
 * @module vitest.aliases
 * @since 1.0.0
 * @author Jeff Rose
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Absolute repository root, derived from this module's own location rather
// than the importing config's directory — app configs live one level deeper
// than the root config, and all of them must resolve to the same packages.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '.');

/** Ordered `@blue/*` → `packages/<pkg>/src` alias table consumed by every Vitest config. */
export const blueAliases: { find: RegExp; replacement: string }[] = [
    // Live `@blue/util` subpaths only — `function`/`list`/`logic`/`object`/`relation`
    // were aspirational imports with no `src/` directory (and no manifest export).
    { find: /^@blue\/util\/crypto/, replacement: resolve(repoRoot, 'packages/blue-util/src/crypto') },
    { find: /^@blue\/util\/math/, replacement: resolve(repoRoot, 'packages/blue-util/src/math') },
    { find: /^@blue\/util\/string/, replacement: resolve(repoRoot, 'packages/blue-util/src/string') },
    { find: /^@blue\/util\/types/, replacement: resolve(repoRoot, 'packages/blue-util/src/type') },
    { find: /^@blue\/util\/type/, replacement: resolve(repoRoot, 'packages/blue-util/src/type') },

    { find: /^@blue\/core$/, replacement: resolve(repoRoot, 'packages/blue-core/src') },
    { find: /^@blue\/dom$/, replacement: resolve(repoRoot, 'packages/blue-dom/src') },
    { find: /^@blue\/util$/, replacement: resolve(repoRoot, 'packages/blue-util/src') },
    { find: /^@blue\/factory$/, replacement: resolve(repoRoot, 'packages/blue-factory/src') },
    { find: /^@blue\/context$/, replacement: resolve(repoRoot, 'packages/blue-context/src') },
    { find: /^@blue\/router$/, replacement: resolve(repoRoot, 'packages/blue-router/src') },
    { find: /^@blue\/host$/, replacement: resolve(repoRoot, 'packages/blue-host/src') },
    { find: /^@blue\/view$/, replacement: resolve(repoRoot, 'packages/blue-view/src') },
    { find: /^@blue\/view-ejs$/, replacement: resolve(repoRoot, 'packages/blue-view-ejs/src') },
    { find: /^@blue\/view-webcomponent$/, replacement: resolve(repoRoot, 'packages/blue-view-webcomponent/src') },
    { find: /^@blue\/http$/, replacement: resolve(repoRoot, 'packages/blue-http/src') },
    { find: /^@blue\/content$/, replacement: resolve(repoRoot, 'packages/blue-content/src') },
    { find: /^@blue\/content-i18next$/, replacement: resolve(repoRoot, 'packages/blue-content-i18next/src') },
    { find: /^@blue\/platform-web$/, replacement: resolve(repoRoot, 'packages/blue-platform-web/src') },
    { find: /^@blue\/platform-node$/, replacement: resolve(repoRoot, 'packages/blue-platform-node/src') },
    { find: /^@blue\/dispatcher$/, replacement: resolve(repoRoot, 'packages/blue-dispatcher/src') },
    { find: /^@blue\/boot$/, replacement: resolve(repoRoot, 'packages/blue-boot/src') },
    { find: /^@blue\/service$/, replacement: resolve(repoRoot, 'packages/blue-service/src') },
    { find: /^@blue\/scheduler$/, replacement: resolve(repoRoot, 'packages/blue-scheduler/src') },
    { find: /^@blue\/jobs$/, replacement: resolve(repoRoot, 'packages/blue-jobs/src') },
    { find: /^@blue\/locks$/, replacement: resolve(repoRoot, 'packages/blue-locks/src') },
    { find: /^@blue\/cache$/, replacement: resolve(repoRoot, 'packages/blue-cache/src') },
    { find: /^@blue\/proxy$/, replacement: resolve(repoRoot, 'packages/blue-proxy/src') },
    { find: /^@blue\/resilience$/, replacement: resolve(repoRoot, 'packages/blue-resilience/src') },
    { find: /^@blue\/redis\/cache$/, replacement: resolve(repoRoot, 'packages/blue-redis/src/cache') },
    { find: /^@blue\/redis\/pubsub$/, replacement: resolve(repoRoot, 'packages/blue-redis/src/pubsub') },
    { find: /^@blue\/redis\/locks$/, replacement: resolve(repoRoot, 'packages/blue-redis/src/locks') },
    { find: /^@blue\/redis$/, replacement: resolve(repoRoot, 'packages/blue-redis/src') },
    { find: /^@blue\/socket$/, replacement: resolve(repoRoot, 'packages/blue-socket/src') },
    { find: /^@blue\/signals$/, replacement: resolve(repoRoot, 'packages/blue-signals/src') },
    { find: /^@blue\/log$/, replacement: resolve(repoRoot, 'packages/blue-log/src') },
    { find: /^@blue\/telemetry$/, replacement: resolve(repoRoot, 'packages/blue-telemetry/src') },
    { find: /^@blue\/telemetry-node$/, replacement: resolve(repoRoot, 'packages/blue-telemetry-node/src') },
    { find: /^@blue\/telemetry-web$/, replacement: resolve(repoRoot, 'packages/blue-telemetry-web/src') },
    { find: /^@blue\/oxlint-plugin$/, replacement: resolve(repoRoot, 'packages/blue-oxlint-plugin/src') },
    { find: /^@blue\/orm$/, replacement: resolve(repoRoot, 'packages/blue-orm/src') },
    { find: /^@blue\/orm-drizzle$/, replacement: resolve(repoRoot, 'packages/blue-orm-drizzle/src') },
    { find: /^@blue\/management$/, replacement: resolve(repoRoot, 'packages/blue-management/src') },
    { find: /^@blue\/auth-core$/, replacement: resolve(repoRoot, 'packages/blue-auth-core/src') },
    { find: /^@blue\/auth-server$/, replacement: resolve(repoRoot, 'packages/blue-auth-server/src') },
    { find: /^@blue\/auth-client$/, replacement: resolve(repoRoot, 'packages/blue-auth-client/src') },
    { find: /^@blue\/openapi$/, replacement: resolve(repoRoot, 'packages/blue-openapi/src') },
    { find: /^@blue\/generators$/, replacement: resolve(repoRoot, 'packages/blue-generators/src') },
    { find: /^@blue\/test$/, replacement: resolve(repoRoot, 'packages/blue-test/src') },
    { find: /^@blue\/inspect$/, replacement: resolve(repoRoot, 'packages/blue-inspect/src') },
];
