# Micro Frontends

A micro frontend architecture lets one application be composed from slices
that are built, shipped, and reasoned about independently. Ndigo supports two
shapes — hosted feature applications, composed by `@ndigo/host`, and
server-rendered islands — and treats their boundaries as data contracts rather
than shared code. This page maps the two shapes, the lifecycle they follow, and
the rules that keep them independent.

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

The shell owns navigation and composition. `@ndigo/host` supplies the
orchestration: `HostManager` registers features, claims their route partitions,
and mounts them into the shell's context. A feature owns the routes under its
prefix and the services it creates. Communication across the boundary is
explicit in both directions: through declared shared dependencies and through
allowlisted event relays.

## Registration and Lifecycle

A feature is declared once: its name, route prefix, how to load it, the
dependencies it requires or optionally accepts, the relays it needs, and what
should happen when it is deactivated.

```ts
import { createShellContext } from '@ndigo/context';
import { HostManager } from '@ndigo/host';

// Shell setup, including the shared registry, is in Micro Frontends §2.
const shell = createShellContext({ name: 'site-shell' });
const host = new HostManager(shell, { activationPolicy: 'exclusive' });

host.registerFeature({
    name: 'checkout',
    prefix: '/checkout',
    loader: () => import('./features/checkout'), // exports createContext(parent)
    dependencies: { requires: { cart: '^1.0.0' } },
    unmountPolicy: 'close',
});
```

The declaration is the whole integration: the loader resolves a module that
exports `createContext(parent)`, required dependencies are checked against the
shell's registry at mount, and duplicate names throw.

| Phase                | What happens                                                                                                               |
| :------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| Register             | One declaration adds the feature to the mount registry and claims its route partition; duplicate names are rejected        |
| Activate & Mount     | Navigation matches the prefix; the feature is loaded lazily and mounted once; a failed load retries on the next activation |
| Deactivate & Unmount | Leaving the prefix applies the policy: preserve the context for a later return, or destroy it with its gateway             |
| Teardown             | `unregister` closes the feature and frees its name; `destroy` does that for every feature                                  |

## Shared Dependencies

- The shell declares shared singletons; features declare required and optional
  version ranges. A missing or incompatible required dependency fails at mount
  time rather than surfacing later as a subtle duplicate.
- A shared dependency is shell-managed: child contexts resolve it from the
  parent chain instead of registering their own copy.
- This is the runtime equivalent of [import maps][import-maps]: the shell
  decides which version every feature sees. There is deliberately no
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
  the component that should take over — the [islands architecture][islands]
  pattern: static HTML first, interactivity only where it is needed.
- The client upgrades the marker into a live [custom element][custom-elements]
  and hands it the restored model; the server-rendered fallback stays visible
  until the component's first render.
- For reactive updates, the server pushes model changes over
  [server-sent events][sse]; the island subscribes through a typed stream and
  re-renders.
- The integration contract is the name–tag–schema triple. `IslandView` (in
  `@ndigo/view`) serializes the model and `hydrateIslands()` (in
  `@ndigo/view-webcomponent`) restores it; pushed updates are validated against
  their response schema. What does not exist yet is a cross-application
  catalog where a host and its islands agree on the triple ahead of time.

## Standalone Principles

Minimize integration testing: features and islands must not import one
another's code. Their boundaries are data contracts — context values and the
serialized island model — so an integration surface is one schema, not a graph
of call sites. `apps/06-ndigo-host-demo` (three lazy feature chunks) and
`apps/03-ndigo-todo-web` (a feature shell around TodoMVC) both work this way;
the [Examples](https://ndigo.dev/examples/) page lists them.

## Comparison with single-SPA

| Concern                       | [single-SPA][single-spa]               | Ndigo                                                         |
| :---------------------------- | :------------------------------------- | :------------------------------------------------------------ |
| Registration                  | Application registration plus activity | One declaration per feature, partitioned by route prefix      |
| Lifecycle                     | Separate bootstrap, mount, and unmount | Mount and unmount are the only phases; no separate bootstrap  |
| Startup gating                | Explicit start step                    | No start gate; the shell composes on first navigation         |
| Shared dependencies           | Import maps                            | Runtime registry with version ranges validated at mount       |
| Framework-agnostic components | Framework adapters                     | Web components and context values; islands are data-bound     |
| Integration testing           | Application-level integration          | Data contracts; features and islands never import one another |

## Where to Go Next

- [Signals & Islands](../guides/signals-and-islands.md) — the
  reactive half in detail: streaming, event bridges, hydration, and
  server-sent updates.
- [Micro Frontends](../guides/micro-frontends.md) — the host and
  feature tutorial.
- [Reference → Packages](https://ndigo.dev/reference/packages/) — the host,
  context, router, view, and web-component packages.
- [Examples](https://ndigo.dev/examples/) — the host demos and the reactive
  island demo.

[islands]: https://jasonformat.com/islands-architecture/
[custom-elements]: https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements
[import-maps]: https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap
[single-spa]: https://single-spa.js.org/docs/getting-started-overview/
[sse]: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events
