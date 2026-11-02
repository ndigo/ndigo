# AD-18: Host runtime — centralized micro frontend orchestration in the shell context

**Date:** 2026-09-13
**Status:** Accepted — implemented 2026-09-13 (all sequencing steps
complete; see §Implementation status)

## Background

Blue's micro frontend story is split across two host demos, each composing
the same pieces by hand:

| Piece                                          | `apps/blue-host` (shell-composition.ts)   | `apps/blue-todo` (shell-composition.ts) |
| ---------------------------------------------- | ----------------------------------------- | --------------------------------------- |
| Shell context (`createShellContext`)           | ✅                                        | ✅                                      |
| `FeatureContextMountManager` (`@blue/context`) | ✅ `registerFeature` × 3                  | ✅ `registerFeature` × 5                |
| `FeatureRoutingRegistry` (`@blue/router`)      | ✅ `registerFeature` × 3                  | ✅ `registerFeature` × 5                |
| Join mount↔route                               | `mountOnActivate`/`onDeactivate` closures | same closures, plus dispatcher dispatch |

Both hosts register each feature **twice** — once in the mount manager, once
in the routing registry — and hand-join them with closures
(`mountOnActivate`, `onDeactivate: () => unmount(name)`). The two
compositions have already diverged (loaders + context values vs.
`createContext` + relay gateways + dispatcher).

The **centralized application context** (`GenericApplicationContext`, shell
root) holds only shared _values_: `SHARED_DEPENDENCY_REGISTRY_TOKEN` and
shared singletons like `cart`. The host services themselves — mount
manager, routing registry, partition router — are **composition-root
locals**,
returned from `composeHostRuntime`/`composeTodoRuntime` and never resolvable
from the context. Consequences:

- Features (child contexts) cannot mount/unmount themselves, navigate, or
  register at runtime — host orchestration is invisible to them.
- Every host re-implements shell composition; there is no shared seam to
  converge on or test against.
- The gap vs. single-SPA's `registerApplication(name, app, activityFn,
  customProps)` — one call covering registration, lifecycle, and URL
  activation — is real: Blue splits it across two registries joined by
  boilerplate.

AD-03 (Site/Page model) already flags the missing registration API:

> Q3. What is the registration API (decorator? builder? mount call)?

and defers it to a design conversation. This AD makes that decision for the
**host orchestration** half. The Page _concept_, TTFB-vs-TTI contract, and
island name↔tag↔schema binding remain AD-03's open questions (see
§Non-goals).

## Decision

### D1 — A new `HostManager` service, resolvable from the shell context

New package **`@blue/host`** (depends on `@blue/context` + `@blue/router`)
exports:

```ts
const host = new HostManager(shellContext, { metricRecorder });
shellContext.setValue(HOST_MANAGER_TOKEN, host);
```

`HOST_MANAGER_TOKEN` is a `ContextToken<HostManager>` — the same placement
pattern as `SHARED_DEPENDENCY_REGISTRY_TOKEN`
(`feature-context-mount-manager.ts`). The host application becomes a
first-class part of the centralized context: any code that can resolve from
the shell (features, shell auto-configuration, tests) can reach the
orchestrator.

**Why a new package:** `HostManager` composes `FeatureContextMountManager`
(`@blue/context`) with `FeatureRoutingRegistry` (`@blue/router`). Neither
package may grow the other as a dependency: `@blue/router` today depends
only on core/factory/http/util (`package.json`), and `@blue/context` is the
more fundamental layer. A dedicated package owns the composition without
polluting either concern — consistent with the package-separation doctrine
(`docs/plans/2026-09-04_PACKAGE_SEPARATION.md`). Rejected alternative:
`HostManager` in `@blue/router` with a new context dependency — forces the
router to know context lifecycle concerns for a composition-only consumer.
Naming: package `@blue/host` (distinct from the demo app `apps/blue-host`);
class `HostManager` conforms to the role-based suffixes of `STYLE_GUIDE.md`
§3.11 (`*Manager` = "manages lifecycle or coordinates multiple components",
matching `FeatureContextMountManager`). The _concept_ keeps the established
"host runtime"/"composed runtime" wording (`composeHostRuntime`,
`composeTodoRuntime`, `TodoRuntimeComposition`) — "runtime" names the
composed whole in prose, not the class.

### D2 — One registration call instead of two

```ts
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    loader: () => import('./features/catalog'),   // or createContext(parent)
    dependencies: { requires: { router: '^1.0.0' } },
    relays: [...],                                // optional — event gateway
    gatewayOptions: {...},                        // optional
    unmountPolicy: 'preserve',                    // default 'preserve'
    onRoute: (route) => {...},                    // optional — e.g. dispatcher.dispatch
    onDeactivate: () => {...},                    // optional — after unmount on deactivation
});
```

Internally this registers in `FeatureContextMountManager` **and**
`FeatureRoutingRegistry` and wires the join (mount on activate, unmount on
deactivate, optional route dispatch) — deleting the per-host closures.
Registration is pure delegation: `HostManager` adds **zero new lifecycle
semantics**; mount/unmount/dependency-validation/metrics behavior is
exactly the proven `FeatureContextMountManager` +
`DefaultSharedDependencyRegistry` + `FeatureRoutingRegistry` machinery.

### D3 — Public surface

| Member                            | Behavior                                                                 |
| --------------------------------- | ------------------------------------------------------------------------ |
| `registerFeature`                 | One-call registration (D2); throws on duplicate name                     |
| `unregister(name)`                | **New capability**: unmount (close policy) + remove from both registries |
| `mount`/`mountLazy`               | Delegate to mount manager (lazy: dynamic import, dedup, retry)           |
| `unmount(name)`                   | Delegate, honoring `unmountPolicy`                                       |
| `isMounted` / `getMountedFeature` | Delegate                                                                 |
| `navigate` / `refresh`            | Delegate to routing registry (`activeFeature` policy honored)            |
| `activeFeature`                   | Delegate                                                                 |
| `destroy()`                       | Unmount all + clear both registries                                      |

`unregister` requires two small additions to existing surface:
`PartitionRouter.unmount(prefix)` (currently only `mount` exists — `partition-router.ts`)
and `FeatureRoutingRegistry.unregister(name)` (deactivate + remove from
feature map). Both are additive; no existing behavior changes.

### D4 — Deployment model unchanged

Features stay compile-time modules (`createContext` exports, dynamic
`import()` chunks) with optional composition-root registration. The
context-resident registry is a **seam**, not a mandate for runtime
self-registration: it makes late registration possible without a breaking
change later, but the default remains "host declares features at boot."

### D5 — Non-goals (explicitly out of scope)

- **Page concept / TTFB-vs-TTI contract** — remains AD-03's open design
  conversation; this AD only answers its registration-API question for the
  host/feature seam.
- **Island registration** — unchanged: `IslandViewResolver` (server, by
  name) + `@TagMapping`/`customElements.define` (client) + `hydrateIslands()`.
  The name↔tag↔model-schema triple stays a documented contract
  (view-resolution strategy, AD-09), not a registry.
- **Module federation / build-level sharing** — unchanged; shared
  dependencies remain the runtime `SharedDependencyRegistry` contract
  (shared-dependency plan, 2026-09-03).
- **New lifecycle semantics** — none; `HostManager` is an assembler.

## Consequences

- **Hosts converge.** `composeHostRuntime`/`composeTodoRuntime` shrink to
  shell context + `HostManager` + declarative registrations; the closure
  boilerplate and the drifted wiring patterns are deleted.
- **Features gain host access.** Resolving `HOST_MANAGER_TOKEN` from the
  shell enables programmatic mount/unmount/navigation — previously
  impossible from a feature.
- **Testability.** Feature tests can replace the shell-context value with a
  mock/stub `HostManager`; host integration tests exercise one seam.
- **New small public surface** in `@blue/router`: `PartitionRouter.unmount`,
  `FeatureRoutingRegistry.unregister`.
- **`PartitionRouter` rename (2026-09-13).** `SiteRouter` was renamed in the
  same session: "Site" was vestigial vocabulary — AD-03 retired the Site
  model, and `SiteRouter` was its only live bearer. `HostRouter` was
  rejected for one-keystroke collision with `HashRouter` in shared import
  blocks; `PartitionRouter` matches the existing `route-partition.ts`
  vocabulary (`matchesPartitionPath`, `normalizePartitionPrefix`,
  `stripPartitionPrefix`, `restorePartitionPrefix`).
- **New package** `@blue/host` (private first, publishable later) + a
  `ContextToken`; both demos' manifests gain the dependency. The demo app
  `apps/blue-host` was npm-renamed `@blue/host` → **`@blue/host-demo`** to
  free the scope name for the package.
- **2026-11-01 (AD-86):** the "publishable later" arrived — `@blue/host`
  dropped `private: true`, so the `packages/` publishable-surface guard now
  carries no exceptions.
- **Documentation:** `apps/README.md` matrix updated; this AD
  cross-references AD-03 (registration API resolved for the host seam, Page
  question untouched).

## Sequencing

1. **`@blue/host` scaffold**: `HostManager` + `HOST_MANAGER_TOKEN` + types;
   unit tests — one-call registration, mount-on-activate, unmount-on-
   deactivate, dependency validation at mount, `unregister`, metrics
   passthrough (`FeatureMetricRecorder`).
2. **`@blue/router` additions**: `PartitionRouter.unmount(prefix)`,
   `FeatureRoutingRegistry.unregister(name)` (+ tests).
3. **Migrate `apps/blue-host`** to `HostManager`; delete closures. Verify:
   identical rendered behavior, same chunks/loading, tests green.
4. **Migrate `apps/blue-todo`** (keeps relays/gateway/dispatcher via the
   `onRoute`/relays options). Delete the dead test seams the migration
   leaves behind: `createTodoPartitionRouter` and
   `TodoRuntimeComposition.partitionRouter` (the registry's
   `partitionRouter` getter remains as the documented escape hatch).
5. **Docs**: `apps/README.md`; cross-link AD-03 ↔ AD-18.

**Acceptance:** zero `mountOnActivate`-style closure joins remain in
`apps/`; every feature is registered by exactly one `registerFeature` call;
a feature context can resolve `HOST_MANAGER_TOKEN`; `createTodoPartitionRouter`
and `TodoRuntimeComposition.partitionRouter` are gone from `apps/blue-todo`;
both demo suites green with unchanged output.

## Implementation status (2026-09-13)

Steps 1–4 complete; step 5 (docs) landed with this record.

1. **`@blue/host` scaffold — DONE.** `HostManager` + `HOST_MANAGER_TOKEN`
   (`packages/blue-host`), 12 unit tests covering one-call registration,
   mount-on-activate, unmount-on-deactivate, dependency validation at mount,
   `mountLazy` dedup, `unregister`, metrics passthrough, and
   `HOST_MANAGER_TOKEN` resolution from the context tree. Two small surface
   completions were added along the way (both consistent with D2/D3):
   optional `onDeactivate` hook (enables the todo demo's unmount relay
   telemetry), and `FeatureContextMountManager.unregister(name)`.
2. **`@blue/router` additions — DONE.** `PartitionRouter.unmount(prefix)`,
   `FeatureRoutingRegistry.unregister(name)` (deactivate + prefix unmount),
   each with tests.
3. **`apps/blue-host` migration — DONE.** `composeHostRuntime` now registers
   catalog/checkout/reports through `HostManager`; entry points resolve the
   token; Vite build confirms the three lazy chunks still split.
4. **`apps/blue-todo` migration — DONE.** Six features registered through
   one `registerFeature` call each (relays/gateway/dispatcher preserved via
   options); dead seams (`createTodoPartitionRouter`,
   `TodoRuntimeComposition.partitionRouter`) deleted together with their two
   duplicate partition tests; unmount relay metrics preserved via
   `onDeactivate`.
5. **Docs — DONE.** `apps/README.md` matrix updated; this AD updated.

**Verification:** `packages/blue-host` 12/12, `packages/blue-router` 68/68,
`packages/blue-context` 274/274, `apps/blue-todo` 43 passed / 1 skipped
(pre-existing placeholder skip); `blue-host` demo production build green;
manifest gate green (`node scripts/check-manifests.mjs`); graft rebuilt.

## Revisit Trigger

- **Independently deployed features self-register at runtime** (distributed
  feature ownership) → the registry becomes a platform contract; revisit
  activation policies, error boundaries, and deployment coupling.
- **AD-03's Page design conversation lands** → reconcile the `Page`
  registration API with `HostManager.registerFeature` rather than
  introducing a second registration seam.
