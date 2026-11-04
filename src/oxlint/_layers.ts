/**
 * The package layer ranks the repository-only lint rules enforce.
 *
 * Ranks are **derived from the runtime dependency graph**, not hand-picked:
 * `rank(p) = 1 + max(rank(d) for d in p's dependencies + peerDependencies)`,
 * with leaf packages at rank 0. `devDependencies` are deliberately excluded —
 * tests and benches may reach across layers. `test/layers.spec.ts` recomputes
 * the ranks from the package manifests and fails when this map drifts.
 *
 * The `no-upward-layer-imports` rule allows an import of `@ndigo/<target>`
 * only when `LAYER_RANK[target] <= LAYER_RANK[importer]`; equal ranks are free
 * to cross-import (siblings). Tooling packages are outside the layer system.
 *
 * @module src/oxlint
 * @since 1.0.0
 * @author Jeff Rose
 */
export const LAYER_RANK: Record<string, number> = {
    // 0 — foundations: no framework imports
    'auth-core': 0,
    dom: 0,
    log: 0,
    util: 0,
    // 1 — kernel primitives
    cluster: 1,
    core: 1,
    signals: 1,
    // 2 — building blocks
    factory: 2,
    socket: 2,
    // 3 — primitives
    content: 3,
    flags: 3,
    http: 3,
    locks: 3,
    orm: 3,
    proxy: 3,
    'rate-limit': 3,
    // 4 — runtime layer
    'auth-client': 4,
    'content-i18next': 4,
    context: 4,
    'flags-openfeature': 4,
    resilience: 4,
    router: 4,
    // 5 — runtime composition
    boot: 5,
    cache: 5,
    host: 5,
    jobs: 5,
    scheduler: 5,
    service: 5,
    view: 5,
    // 6 — integration layer
    dispatcher: 6,
    'orm-drizzle': 6,
    redis: 6,
    'view-ejs': 6,
    'view-webcomponent': 6,
    // 7 — platform layer
    'auth-server': 7,
    inspect: 7,
    openapi: 7,
    'platform-web': 7,
    telemetry: 7,
    // 8 — platform composition
    'platform-node': 8,
    'telemetry-web': 8,
    // 9 — application services
    management: 9,
    'telemetry-node': 9,
};

/**
 * Packages outside the runtime layer system — tooling that legitimately
 * reaches across any rank and is never a layer-ranked runtime dependency.
 */
export const TOOLING_PACKAGES: ReadonlySet<string> = new Set(['cli', 'generators', 'oxlint-plugin', 'test']);
