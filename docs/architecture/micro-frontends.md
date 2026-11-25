# Micro Frontends

A micro frontend architecture lets one application be composed from slices
that are built, shipped, and reasoned about independently. Ndigo supports two
shapes — hosted feature applications and server-rendered islands — and treats
their boundaries as data contracts rather than shared code. This page maps the
two shapes, the lifecycle they follow, and the rules that keep them
independent.

## Two Shapes

| Shape              | What it is                                                                                   | Boundary                                                                           |
| :----------------- | :------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| **Hosted feature** | A child application mounted into the shell and loaded lazily when its route prefix activates | The context tree, the shared-dependency contract, and an allowlisted event gateway |
| **Island**         | A server-rendered web component hydrated on the client from a serialized model               | The serialized model, its schema, and the component's tag name                     |

The hosted path is for _application slices_ with their own services and
lifecycle. The island path is for _presentation units_ that should render fast
and stay independent. They compose: a hosted feature can contain islands.

## Host Stack

```
URL (source of truth)
   │ navigation
   ▼
Shell host ── route partitions ──▶ feature contexts
   │                                  │
   ├── shared dependencies, validated at mount
   └── event gateways, relay only what is allowlisted
```

The shell owns navigation and composition. A feature owns the routes under its
prefix and the services it creates. Communication across the boundary is
explicit in both directions: through declared shared dependencies and through
allowlisted event relays.

## Registration and Lifecycle

A feature is declared once: its name, route prefix, how to load it, the
dependencies it requires or optionally accepts, the relays it needs, and what
should happen when it is deactivated.

| Phase      | What happens                                                                                                        |
| :--------- | :------------------------------------------------------------------------------------------------------------------ |
| Register   | One declaration adds the feature to the mount registry and claims its route partition; duplicate names are rejected |
| Activate   | Navigation matches the prefix; the feature is loaded lazily, mounted once, and retried on failure                   |
| Deactivate | The routing policy decides whether the previous feature is unmounted or kept tracked                                |
| Unmount    | The policy decides whether the context is preserved for return or destroyed with its gateway                        |
| Remove     | The feature leaves both registries and its name becomes available again                                             |
| Teardown   | The host unregisters everything                                                                                     |

## Shared Dependencies

- The shell declares shared singletons; features declare required and optional
  version ranges. A missing or incompatible required dependency fails at mount
  time rather than surfacing later as a subtle duplicate.
- A shared dependency is shell-managed: child contexts resolve it from the
  parent chain instead of registering their own copy.
- This is the runtime equivalent of import maps. There is deliberately no
  build-level module deduplication, because features stay standalone.

## Event Isolation

- Each feature context is a child of the shell. Cross-context events flow only
  through explicitly allowlisted relays.
- Relays are validated by namespace: the shell owns its namespace, each
  feature owns its own. A feature cannot emit into another feature's namespace
  by accident.
- No relay means no cross-feature communication. Blocked relays are visible in
  that feature's telemetry rather than failing silently.

## Islands

- The server renders a marker carrying the island's serialized model and names
  the component that should take over.
- The client upgrades the marker to a live custom element, restores the model,
  and replaces the inert markup.
- For reactive updates, the server pushes model changes over server-sent
  events; the island subscribes through a typed stream and re-renders.
- The integration contract is the name–tag–schema triple. It is documented but
  not yet enforced by a registry.

## Standalone Principles

Minimize integration testing: features and islands must not import one
another's code. Their boundaries are data contracts — context values and the
serialized island model — so an integration surface is one schema, not a graph
of call sites. Both demo hosts exercise this discipline.

## Comparison with single-SPA

| Concern                       | [single-SPA](https://single-spa.js.org/) | Ndigo                                                         |
| :---------------------------- | :--------------------------------------- | :------------------------------------------------------------ |
| Registration                  | Application registration plus activity   | One declaration per feature, partitioned by route prefix      |
| Lifecycle                     | Separate bootstrap, mount, and unmount   | Mount and unmount are the only phases; no separate bootstrap  |
| Startup gating                | Explicit start step                      | No gating step; composition is synchronous                    |
| Shared dependencies           | Import maps                              | Runtime registry with version ranges validated at mount       |
| Framework-agnostic components | Framework adapters                       | Web components and context values; islands are data-bound     |
| Integration testing           | Application-level integration            | Data contracts; features and islands never import one another |

## See Also

- [Guide 29 — Signals & Islands](../guides/29-signals-and-islands.md) — the
  reactive half in detail: streaming, event bridges, hydration, and
  server-sent updates.
- [Guide 31 — Micro Frontends](../guides/31-micro-frontends.md)
  — the host and feature tutorial.
- [Package index](https://ndigo.dev/reference/packages/) — the host, context,
  router, view, and web-component packages.
- [Examples](https://ndigo.dev/examples/) — the host demos and the reactive
  island demo.

## Known Gaps

1. **Page concept and the time-to-first-byte vs time-to-interactive contract** —
   still an open design conversation; the registration mechanism now exists,
   but the page model does not.
2. **Island name–tag–schema triple** — documented contract, no enforcement or
   registry yet.
3. **Runtime self-registration** — the seam exists; the deployment model stays
   compile-time.
