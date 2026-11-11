# Guide 31 — Micro Frontends with `@ndigo/host`

A Ndigo shell can compose independently built application slices without
sharing source code. Each slice is a child application context, mounted under a
route prefix, with its own services and lifecycle; the shell owns the context
tree, the shared singletons, and the route partitions.

`@ndigo/host` is the orchestration layer over `FeatureRoutingRegistry` and
`FeatureContextMountManager`. Islands (guide 29) are the other micro-frontend
shape: presentation units hydrated inside a page rather than full application
contexts. This guide is the host/feature path.

**Audience:** Browser application developers · **Prerequisites:** Guides [02](02-building-a-browser-app.md), [05](05-routing-and-route-conditions.md), and [29](29-signals-and-islands.md) · **Reference app:** `[apps/06-ndigo-host-demo](https://github.com/ndigo/ndigo/tree/main/apps/06-ndigo-host-demo)`, `[apps/03-ndigo-todo-web](https://github.com/ndigo/ndigo/tree/main/apps/03-ndigo-todo-web)`

## What you'll learn

- Build a shell context with a shared-dependency registry.
- Register features with prefixes, lazy loaders, dependencies, and relays.
- Drive activation from the router and understand the unmount policies.
- Keep features isolated while allowing explicit event relays.
- Choose between a hosted feature and an island.

## 1. Two shapes

| Shape | What it is | Boundary |
| -------------- | --------------------------------------------------------- | --------------------------------------------------------- |
| Hosted feature | A child `ApplicationContext` mounted under a route prefix | Context tree + shared-dependency contract + event gateway |
| Island | A server-rendered Web Component hydrated in place | Serialized model + Zod schema + tag name |

Use a hosted feature for an application slice with its own services and
lifecycle (catalog, checkout, reports). Use an island for a presentation unit
that should render fast and stay independent (a counter, a comment thread).

## 2. The shell

The shell is a normal context with a shared-dependency registry and the host
manager attached:

```ts
import { createShellContext, DefaultSharedDependencyRegistry, SHARED_DEPENDENCY_REGISTRY_TOKEN } from '@ndigo/context';
import { HOST_MANAGER_TOKEN, HostManager } from '@ndigo/host';

const shell = createShellContext({ name: 'site-shell' });

const shared = new DefaultSharedDependencyRegistry();
shared.declare({
    router: { singleton: true, version: '1.0.0' },
    cart: { singleton: true, version: '1.0.0' },
});
shell.setValue(SHARED_DEPENDENCY_REGISTRY_TOKEN, shared);

const host = new HostManager(shell, { activationPolicy: 'exclusive' });
shell.setValue(HOST_MANAGER_TOKEN, host);
```

`createShellContext` returns a `GenericApplicationContext`; `HostManager`
takes the shell as its parent. The `HOST_MANAGER_TOKEN` makes the manager
reachable from features and interceptors without a global.

## 3. Registering a feature

One call wires the mount registry and the route partition:

```ts
host.registerFeature({
    name: 'catalog',
    prefix: '/catalog',
    loader: () => import('./features/catalog'),
    dependencies: { requires: { router: '^1.0.0' } },
    unmountPolicy: 'preserve',
});
```

- `prefix` — the URL partition that activates the feature.
- `loader` — a dynamic import resolving to a module with
 `createContext(parent)`; omit it and provide `createContext` for an eager
 feature.
- `dependencies.requires` — semver ranges validated against the shell's shared
 registry at mount; a missing or mismatched required dependency fails the
 mount. `optional` warns instead.
- `relays` — allowlisted event relays (see §5).
- `unmountPolicy` — `preserve` keeps the context alive across activation
 changes; `close` destroys it and its gateway.

Duplicate names throw. `registerFeature` returns the manager, so registrations
chain.

## 4. Activation and lifecycle

The router drives the host by path:

```ts
host.navigate('/catalog/active'); // activates 'catalog', routes '/active'
```

`navigate` matches the prefix, mounts the feature (lazily through `mountLazy`
when a loader is present), and calls `onRoute` with the stripped feature-local
route. With `activationPolicy: 'exclusive'`, activating another feature
deactivates the previous one; `tracked` keeps the previous feature mounted and
tracks it.

```ts
host.mount('catalog'); // explicit mount
host.mountLazy('catalog'); // await the loader and mount
host.unmount('catalog'); // honor the registration policy
host.unmount('catalog', 'close'); // override: destroy the context
host.unregister('catalog'); // close + remove, freeing the name
host.destroy(); // unregister everything
```

The mount result is a `FeatureContextComposition` with the child `context` and
an optional `gateway`. The shell can read feature data through that context;
features never import each other.

## 5. Shared dependencies and event isolation

Shared singletons are declared by the shell and validated by version:

```ts
// shell
shared.declare({ cart: { singleton: true, version: '1.2.0' } });
shell.setValue(CART, cart);

// feature registration
host.registerFeature({
    name: 'checkout',
    prefix: '/checkout',
    loader: () => import('./features/checkout'),
    dependencies: { requires: { cart: '^1.0.0' } },
});
```

A bean marked `@sharedDependency` is shell-managed: child contexts skip
registration and resolve it from the parent chain. This is the runtime
equivalent of import maps; features stay standalone and no build-level module
deduplication is required.

Cross-feature events do not flow by default. Each feature is a child context;
only explicit relays are allowed:

```ts
host.registerFeature({
    name: 'reports',
    prefix: '/reports',
    loader: () => import('./features/reports'),
    relays: [{ from: 'cart:updated', to: 'reports:cart-updated' }],
});
```

`ContextEventGateway` validates relay names (shell-owned `site:*`,
feature-owned `<feature>:*`) and blocks the rest. No relay means no
cross-feature communication — that is the isolation guarantee, not a bug.

## 6. Features vs islands

- A feature owns a **context**, services, and a route partition. It is the right
 unit for an application slice with its own lifecycle.
- An island owns a **model** and a tag. It is the right unit for a presentation
 component embedded in a server-rendered page; [guide 29](29-signals-and-islands.md) covers hydration and
 SSE.
- They compose: a feature's page can contain islands; an island never mounts a
 feature. Keep the boundary at data contracts (context values, serialized
 model), not shared imports.

## 7. Pitfalls

- **A feature is not a module.** It has its own context and lifecycle; do not
 reach into another feature's context.
- **Required dependencies fail the mount.** Declare the exact semver range and
 the shared registry entry; an optional dependency only warns.
- **`preserve` keeps state across navigations.** Choose `close` when the feature
 should reset, and remember that `close` destroys the gateway too.
- **Relays are allowlisted.** An event that “doesn't arrive” is usually a
 missing relay or a namespace rejection.
- **The loader contract is `createContext(parent)`.** A module that exports a
 different shape fails at mount, not at import.
- **Do not duplicate the shell in each feature.** Shared singletons belong in
 the shell registry; features resolve them.

## See also

- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser preset and router
- [Guide 05 — Routing & Route Conditions](05-routing-and-route-conditions.md) — partitions and feature routing
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — the island shape
- [Micro Frontends architecture](../architecture/micro-frontends.md) — the full map and design decisions
- [`@ndigo/host`](../../packages/ndigo-host/README.md) — `HostManager`
- [[apps/06-ndigo-host-demo](https://github.com/ndigo/ndigo/tree/main/apps/06-ndigo-host-demo)](../../[apps/06-ndigo-host-demo](https://github.com/ndigo/ndigo/tree/main/apps/06-ndigo-host-demo)/README.md) — three lazy feature chunks
- and — host runtime and shared dependencies
