# Micro Frontends in BlueJS — architecture map

**Status:** Live — the patterns below are implemented (`@blue/host` since
2026-09-13, AD-18) and demonstrated by `apps/blue-host` and `apps/blue-todo`.

This is the cross-cutting map for BlueJS micro frontends: how the shell
hosts feature contexts, how islands fit in, and where the seams,
contracts, and decision records live.

## Two complementary mechanisms

BlueJS has **two** micro frontend shapes, used independently or together:

| Shape              | What it is                                                                           | Boundary                                                  | Where                                         |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------- |
| **Hosted feature** | A child `ApplicationContext` mounted into the shell, lazy-loaded on route activation | Context tree + shared-dependency contract + event gateway | `@blue/host`, `@blue/context`, `@blue/router` |
| **Island**         | A server-rendered web component (`data-blue-island` marker) hydrated on the client   | Serialized model (JSON) + zod schema + tag name           | `@blue/view`, `@blue/view-webcomponent`       |

The host/feature path is for _application slices_ with their own services and
lifecycle; the island path is for _presentation units_ that should render
fast and stay independent.

## Host stack

```
HashRouter / BrowserDispatcher        ← URL source of truth (platform)
        │ navigate(path)
        ▼
HostManager  (resolvable via HOST_MANAGER_TOKEN from the shell context)
        │ delegates
        ├──► FeatureRoutingRegistry ── PartitionRouter   (prefix partitions; exclusive/tracked)
        └──► FeatureContextMountManager ── SharedDependencyRegistry (semver validation at mount)
                     │
        context tree:  shell ─ newChild → feature contexts (relay gateways, event isolation)
```

## Registration and lifecycle

One call per feature (`@blue/host`):

```ts
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    loader: () => import('./features/catalog'),   // or createContext(parent)
    dependencies: { requires: { router: '^1.0.0' } },  // validated at mount
    relays: [...],        // event-gateway relays (optional)
    unmountPolicy: 'preserve',  // 'preserve' | 'close'
    onRoute: (route) => {},          // feature-local route dispatch
    onDeactivate: () => {},           // post-unmount hook
});
```

| Phase      | API                      | Semantics                                                           |
| ---------- | ------------------------ | ------------------------------------------------------------------- |
| register   | `registerFeature`        | one call = mount registry + route partition; duplicate name throws  |
| activate   | `navigate` / `refresh`   | route matches prefix → mount (lazy via `mountLazy`, dedup, retry)   |
| deactivate | policy-driven            | `exclusive`: prior feature unmounted; `tracked`: tracked            |
| unmount    | `unmount(name, policy?)` | `preserve` keeps context alive; `close` destroys it and its gateway |
| remove     | `unregister(name)`       | close + remove from both registries; name is free again             |
| teardown   | `destroy()`              | unregister everything                                               |

## Shared dependencies

- Shell declares shared singletons via `SharedDependencyRegistry`
  (`SHARED_DEPENDENCY_REGISTRY_TOKEN` in the shell context); features declare
  `requires`/`optional` ranges; validation runs at mount time (missing or
  semver-mismatched required deps throw).
- `@shared()` decorator marks a bean shell-managed: child contexts skip
  registration and resolve from the parent chain (enforced in
  `AbstractFactory`).
- This is the runtime equivalent of import maps — no build-level module
  deduplication by design (features stay standalone).

## Event isolation

- Each feature context is a child of the shell; cross-context events flow
  **only** through explicitly allowlisted relays
  (`ContextEventGateway`), validated by namespace
  (`NamespaceRelayValidationStrategy`: `site:*` shell-owned,
  `<feature>:*` feature-owned).
- No relay = no cross-feature communication; blocked relays are
  logged/counted per feature telemetry.

## Islands

- Server: `IslandView` emits `<tag data-blue-island data-blue-model="…">`;
  `IslandViewResolver` resolves a view name → island marker (the
  controller↔client link).
- Client: `hydrateIslands()` upgrades markers to live custom elements
  (`@TagMapping`-registered), restores `.model`, replaces inert markup.
- Reactive half (AD-9): server pushes model updates over SSE
  (`ServerSentEventView`/`SSEEmitter`); the island subscribes via a typed
  service-stream into `@blue/signals` (`streamToSignal`) and re-renders.
- The integration contract is the **name ↔ tag ↔ zod schema triple** —
  documented in the view-resolution strategy, not yet enforced by a
  registry.

## Standalone doctrine

Minimize integration testing: features/islands must not import one
another's code. Their boundaries are **data contracts** (context values and
the serialized island model), so an integration surface is one schema, not
a graph of call sites. Both demo hosts exercise this discipline.

## Single-SPA comparison (condensed)

| Single-SPA                                    | BlueJS                                                   | Note                                 |
| --------------------------------------------- | -------------------------------------------------------- | ------------------------------------ |
| `registerApplication` + activity fn           | `HostManager.registerFeature({name, prefix, …})`         | Prefix partitions; single call       |
| bootstrap/mount/unmount                       | `mount`/`mountLazy`/`unmount(policy)`/`unregister`       | No separate bootstrap phase          |
| `start()` gating                              | —                                                        | Not implemented; composition is sync |
| import maps / shared deps                     | `SharedDependencyRegistry` + `@shared` + semver at mount | Runtime-validated, stronger          |
| framework-agnostic apps                       | Web components + context values                          | Islands = data-bound components      |
| standalone apps / minimal integration testing | Island model contracts; feature contexts with gateways   | Same doctrine                        |

## Documentation pointers

- **AD-18** (2026-09-13) — host orchestration decision + implementation
  status: `docs/decisions/2026-09-13_AD18_HOST_RUNTIME.md`
- **AD-3** — legacy Site/Page lineage; the open **Page concept / TTFB-vs-TTI**
  question: `docs/decisions/2026-09-07_AD3_SITE_PAGE_MODEL.md`
- **AD-9** — SSE-first island reactivity: `docs/decisions/2026-09-05_AD9_SERVER_PUSH.md`
- **Shared dependency contract** (implemented): `docs/plans/2026-09-03_SHARED_DEPENDENCY_CONTRACT.md`
- **Scale 2 context + routing** (completed): `docs/plans/2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md`
- **View resolution strategy** (island resolver): `docs/plans/2026-09-06_VIEW_RESOLUTION_STRATEGY.md`
- **Route registry** (type-safe URLs): `docs/plans/2026-09-03_ROUTE_REGISTRY.md`
- **Framework assessment** (partial hydration ✅, MFE shell status):
  `docs/reference/2026-09-01_FEATURE_ASSESSMENT.md`
- **Demo hosts**: `apps/blue-host` (@blue/host-demo), `apps/blue-todo`,
  reactive island: `apps/blue-island`

## Known gaps (deliberate)

1. **Page concept / TTFB-vs-TTI contract** — AD-3's open design
   conversation; AD-18 answered its registration-API half only.
2. **Island name ↔ tag ↔ schema triple** — documented contract, no
   enforcement/registry yet.
3. **Runtime self-registration** — the `HOST_MANAGER_TOKEN` seam makes it
   possible; the deployment model stays compile-time (AD-18 D4).
