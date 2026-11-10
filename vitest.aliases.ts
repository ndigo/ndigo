/**
 * Shared Vitest resolve-alias table for `@ndigo/*` workspace packages.
 *
 * Both the root `vitest.config.ts` and every app `vitest.config.ts` import this
 * table, so tests resolve `@ndigo/*` against the live `packages/<pkg>/src` sources
 * rather than the built `lib/` output that the `node_modules` symlinks expose.
 * A source-only change is therefore exercised without a rebuild, and a missing
 * `lib/` can no longer break a lane (HI-6/TST-B).
 *
 * The aliases are ordered: package-root entries must not capture subpath
 * imports such as `@ndigo/util/types`, so the more specific subpaths come first.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// Absolute repository root, derived from this module's own location rather
// than the importing config's directory — app configs live one level deeper
// than the root config, and all of them must resolve to the same packages.
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '.');

/** Ordered `@ndigo/*` → `packages/<pkg>/src` alias table consumed by every Vitest config. */
export const ndigoAliases: { find: RegExp; replacement: string }[] = [
    // Registry copy-in sources use the shadcn `@/` import prefix; the CLI
    // rewrites it to the consumer's aliases, and tests resolve it to the
    // package's registry tree.
    { find: '@/lib', replacement: resolve(repoRoot, 'packages/ndigo-ui/registry/base') },

    // Live `@ndigo/util` subpaths only — `function`/`list`/`logic`/`object`/`relation`
    // were aspirational imports with no `src/` directory (and no manifest export).
    { find: /^@ndigo\/util\/crypto/, replacement: resolve(repoRoot, 'packages/ndigo-util/src/crypto') },
    { find: /^@ndigo\/util\/string/, replacement: resolve(repoRoot, 'packages/ndigo-util/src/string') },
    { find: /^@ndigo\/util\/types/, replacement: resolve(repoRoot, 'packages/ndigo-util/src/type') },
    { find: /^@ndigo\/util\/type/, replacement: resolve(repoRoot, 'packages/ndigo-util/src/type') },

    { find: /^@ndigo\/core$/, replacement: resolve(repoRoot, 'packages/ndigo-core/src') },
    { find: /^@ndigo\/dom$/, replacement: resolve(repoRoot, 'packages/ndigo-dom/src') },
    { find: /^@ndigo\/util$/, replacement: resolve(repoRoot, 'packages/ndigo-util/src') },
    { find: /^@ndigo\/ui$/, replacement: resolve(repoRoot, 'packages/ndigo-ui/src') },
    { find: /^@ndigo\/factory$/, replacement: resolve(repoRoot, 'packages/ndigo-factory/src') },
    { find: /^@ndigo\/flags$/, replacement: resolve(repoRoot, 'packages/ndigo-flags/src') },
    { find: /^@ndigo\/context$/, replacement: resolve(repoRoot, 'packages/ndigo-context/src') },
    { find: /^@ndigo\/router$/, replacement: resolve(repoRoot, 'packages/ndigo-router/src') },
    { find: /^@ndigo\/host$/, replacement: resolve(repoRoot, 'packages/ndigo-host/src') },
    { find: /^@ndigo\/view$/, replacement: resolve(repoRoot, 'packages/ndigo-view/src') },
    { find: /^@ndigo\/view-ejs$/, replacement: resolve(repoRoot, 'packages/ndigo-view-ejs/src') },
    { find: /^@ndigo\/view-toon$/, replacement: resolve(repoRoot, 'packages/ndigo-view-toon/src') },
    { find: /^@ndigo\/view-webcomponent$/, replacement: resolve(repoRoot, 'packages/ndigo-view-webcomponent/src') },
    { find: /^@ndigo\/http$/, replacement: resolve(repoRoot, 'packages/ndigo-http/src') },
    { find: /^@ndigo\/content$/, replacement: resolve(repoRoot, 'packages/ndigo-content/src') },
    { find: /^@ndigo\/content-i18next$/, replacement: resolve(repoRoot, 'packages/ndigo-content-i18next/src') },
    { find: /^@ndigo\/platform-web$/, replacement: resolve(repoRoot, 'packages/ndigo-platform-web/src') },
    { find: /^@ndigo\/platform-node$/, replacement: resolve(repoRoot, 'packages/ndigo-platform-node/src') },
    { find: /^@ndigo\/dispatcher$/, replacement: resolve(repoRoot, 'packages/ndigo-dispatcher/src') },
    { find: /^@ndigo\/boot$/, replacement: resolve(repoRoot, 'packages/ndigo-boot/src') },
    { find: /^@ndigo\/service$/, replacement: resolve(repoRoot, 'packages/ndigo-service/src') },
    { find: /^@ndigo\/scheduler$/, replacement: resolve(repoRoot, 'packages/ndigo-scheduler/src') },
    { find: /^@ndigo\/jobs$/, replacement: resolve(repoRoot, 'packages/ndigo-jobs/src') },
    { find: /^@ndigo\/locks$/, replacement: resolve(repoRoot, 'packages/ndigo-locks/src') },
    { find: /^@ndigo\/rate-limit$/, replacement: resolve(repoRoot, 'packages/ndigo-rate-limit/src') },
    { find: /^@ndigo\/cluster$/, replacement: resolve(repoRoot, 'packages/ndigo-cluster/src') },
    { find: /^@ndigo\/cli$/, replacement: resolve(repoRoot, 'packages/ndigo-cli/src') },
    { find: /^@ndigo\/cache$/, replacement: resolve(repoRoot, 'packages/ndigo-cache/src') },
    { find: /^@ndigo\/proxy$/, replacement: resolve(repoRoot, 'packages/ndigo-proxy/src') },
    { find: /^@ndigo\/resilience$/, replacement: resolve(repoRoot, 'packages/ndigo-resilience/src') },
    { find: /^@ndigo\/redis\/cache$/, replacement: resolve(repoRoot, 'packages/ndigo-redis/src/cache') },
    { find: /^@ndigo\/redis\/pubsub$/, replacement: resolve(repoRoot, 'packages/ndigo-redis/src/pubsub') },
    { find: /^@ndigo\/redis\/locks$/, replacement: resolve(repoRoot, 'packages/ndigo-redis/src/locks') },
    { find: /^@ndigo\/redis\/rate-limit$/, replacement: resolve(repoRoot, 'packages/ndigo-redis/src/rate-limit') },
    { find: /^@ndigo\/redis$/, replacement: resolve(repoRoot, 'packages/ndigo-redis/src') },
    { find: /^@ndigo\/socket$/, replacement: resolve(repoRoot, 'packages/ndigo-socket/src') },
    { find: /^@ndigo\/signals$/, replacement: resolve(repoRoot, 'packages/ndigo-signals/src') },
    { find: /^@ndigo\/log$/, replacement: resolve(repoRoot, 'packages/ndigo-log/src') },
    { find: /^@ndigo\/telemetry$/, replacement: resolve(repoRoot, 'packages/ndigo-telemetry/src') },
    { find: /^@ndigo\/telemetry-node$/, replacement: resolve(repoRoot, 'packages/ndigo-telemetry-node/src') },
    { find: /^@ndigo\/telemetry-web$/, replacement: resolve(repoRoot, 'packages/ndigo-telemetry-web/src') },
    { find: /^@ndigo\/oxlint-plugin$/, replacement: resolve(repoRoot, 'packages/ndigo-oxlint-plugin/src') },
    { find: /^@ndigo\/orm$/, replacement: resolve(repoRoot, 'packages/ndigo-orm/src') },
    { find: /^@ndigo\/orm-drizzle$/, replacement: resolve(repoRoot, 'packages/ndigo-orm-drizzle/src') },
    { find: /^@ndigo\/management$/, replacement: resolve(repoRoot, 'packages/ndigo-management/src') },
    { find: /^@ndigo\/auth-core$/, replacement: resolve(repoRoot, 'packages/ndigo-auth-core/src') },
    { find: /^@ndigo\/auth-server$/, replacement: resolve(repoRoot, 'packages/ndigo-auth-server/src') },
    { find: /^@ndigo\/auth-client$/, replacement: resolve(repoRoot, 'packages/ndigo-auth-client/src') },
    { find: /^@ndigo\/openapi$/, replacement: resolve(repoRoot, 'packages/ndigo-openapi/src') },
    { find: /^@ndigo\/mcp$/, replacement: resolve(repoRoot, 'packages/ndigo-mcp/src') },
    { find: /^@ndigo\/ai$/, replacement: resolve(repoRoot, 'packages/ndigo-ai/src') },
    { find: /^@ndigo\/ai-sdk$/, replacement: resolve(repoRoot, 'packages/ndigo-ai-sdk/src') },
    { find: /^@ndigo\/generators$/, replacement: resolve(repoRoot, 'tools/generators/src') },
    { find: /^@ndigo\/test$/, replacement: resolve(repoRoot, 'packages/ndigo-test/src') },
    { find: /^@ndigo\/inspect$/, replacement: resolve(repoRoot, 'packages/ndigo-inspect/src') },
    { find: /^@ndigo\/flags-openfeature$/, replacement: resolve(repoRoot, 'packages/ndigo-flags-openfeature/src') },
    { find: /^create-ndigo-app$/, replacement: resolve(repoRoot, 'packages/create-ndigo-app/src') },
];
