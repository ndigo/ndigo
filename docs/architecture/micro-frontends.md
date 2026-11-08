# Micro Frontends in Ndigo — architecture map

**Status:** Live — the patterns below are implemented (`@ndigo/host` since
2026-09-13) and demonstrated by `apps/06-ndigo-host-demo` and `apps/03-ndigo-todo-web`.

This is the cross-cutting map for Ndigo micro frontends: how the shell
hosts feature contexts, how islands fit in, and where the seams,
contracts, and decision records live.

## Two complementary mechanisms

Ndigo has **two** micro frontend shapes, used independently or together:

| Shape              | What it is                                                                           | Boundary                                                  | Where                                            |
| ------------------ | ------------------------------------------------------------------------------------ | --------------------------------------------------------- | ------------------------------------------------ |
| **Hosted feature** | A child `ApplicationContext` mounted into the shell, lazy-loaded on route activation | Context tree + shared-dependency contract + event gateway | `@ndigo/host`, `@ndigo/context`, `@ndigo/router` |
| **Island**         | A server-rendered web component (`data-ndigo-island` marker) hydrated on the client  | Serialized model (JSON) + zod schema + tag name           | `@ndigo/view`, `@ndigo/view-webcomponent`        |

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

One call per feature (`@ndigo/host`):

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
- `@sharedDependency()` decorator marks a bean shell-managed: child contexts skip
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

- Server: `IslandView` emits `<tag data-ndigo-island data-ndigo-model="…">`;
  `IslandViewResolver` resolves a view name → island marker (the
  controller↔client link).
- Client: `hydrateIslands()` upgrades markers to live custom elements
  (`@TagMapping`-registered), restores `.model`, replaces inert markup.
- Reactive half: server pushes model updates over SSE
  (`ServerSentEventView`/`SSEEmitter`); the island subscribes via a typed
  service-stream into `@ndigo/signals` (`streamToSignal`) and re-renders.
- The integration contract is the **name ↔ tag ↔ zod schema triple** —
  documented in the view-resolution strategy, not yet enforced by a
  registry.

## Standalone doctrine

Minimize integration testing: features/islands must not import one
another's code. Their boundaries are **data contracts** (context values and
the serialized island model), so an integration surface is one schema, not
a graph of call sites. Both demo hosts exercise this discipline.

## Single-SPA comparison (condensed)

| Single-SPA                                    | Ndigo                                                              | Note                                 |
| --------------------------------------------- | ------------------------------------------------------------------ | ------------------------------------ |
| `registerApplication` + activity fn           | `HostManager.registerFeature({name, prefix, …})`                   | Prefix partitions; single call       |
| bootstrap/mount/unmount                       | `mount`/`mountLazy`/`unmount(policy)`/`unregister`                 | No separate bootstrap phase          |
| `start()` gating                              | —                                                                  | Not implemented; composition is sync |
| import maps / shared deps                     | `SharedDependencyRegistry` + `@sharedDependency` + semver at mount | Runtime-validated, stronger          |
| framework-agnostic apps                       | Web components + context values                                    | Islands = data-bound components      |
| standalone apps / minimal integration testing | Island model contracts; feature contexts with gateways             | Same doctrine                        |

## Documentation pointers

- **host runtime** — host orchestration decision + implementation
  status: `docs/decisions/2026-09-13_AD18_HOST_RUNTIME.md`
- **Site/Page model** — legacy Site/Page lineage; the open **Page concept / TTFB-vs-TTI**
  question: `docs/decisions/2026-09-07_AD03_SITE_PAGE_MODEL.md`
- **SSE server push** — SSE-first island reactivity: `docs/decisions/2026-09-05_AD09_SERVER_PUSH.md`
- **Shared dependency contract** (AD-62): `docs/decisions/2026-09-03_AD62_SHARED_DEPENDENCY_CONTRACT.md`
- **Scale 2 context + routing** (AD-54): `docs/decisions/2026-03-24_AD54_HIERARCHICAL_CONTEXTS_ROUTE_PARTITIONING.md`
- **View resolution strategy** (AD-65): `docs/decisions/2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md`
- **Signals & islands how-to** — [Guide 29](../guides/29-signals-and-islands.md):
  the reactive half in detail (`@ndigo/signals` primitives and decorators,
  stream/event bridges, `hydrateIslands()` + SSE-driven re-render).
- **Route registry** (AD-61): `docs/decisions/2026-09-03_AD61_ROUTE_REGISTRY.md`
- **Framework assessment** (partial hydration ✅, MFE shell status):
  `docs/reference/2026-09-01_FEATURE_ASSESSMENT.md`
- **Demo hosts**: `apps/06-ndigo-host-demo` (@ndigo/host-demo), `apps/03-ndigo-todo-web`,
  reactive island: `apps/07-ndigo-island`

## Known gaps (deliberate)

1. **Page concept / TTFB-vs-TTI contract** — the open design
   conversation; its registration-API half was answered by the host runtime only.
2. **Island name ↔ tag ↔ schema triple** — documented contract, no
   enforcement/registry yet.
3. **Runtime self-registration** — the `HOST_MANAGER_TOKEN` seam makes it
   possible; the deployment model stays compile-time.
