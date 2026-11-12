# Guide 04 — Dependency Injection, Scopes & Lifecycle

The application context is Ndigo's dependency container. It owns every entry,
decides how long each one lives, injects the collaborators an entry asks for, and
closes resources in a defined order when the app stops. This guide covers the
registration surface, the scope strategies, and the lifecycle hooks.

**Audience:** Node and browser application developers · **Prerequisites:** [Guide 01](01-building-a-node-api.md) (Node) or [guide 02](02-building-a-browser-app.md) (browser) · **Reference app:** [apps/05-ndigo-api](https://github.com/ndigo/ndigo/tree/main/apps/05-ndigo-api)

## What you'll learn

- Register entries with `@configuration` classes, `@entry` methods, and tokens.
- Choose between singleton, prototype, hash, refresh, and custom scopes.
- Use the aware callbacks to receive the context and value name.
- Implement `init`, `destroy`/`close`, and smart-lifecycle phases.
- Use parent/child contexts and application events without leaking state.

## 1. The container and the entry

An **application context** is a named, hierarchical container. An **entry** is any
value the context owns under a name or a `ContextToken`. The boot presets create
the root context for you; the container API is the same everywhere.

```ts
import { GenericApplicationContext, ContextToken } from '@ndigo/context';

const context = new GenericApplicationContext('app');
const CLOCK = new ContextToken<Clock>('clock');

context.setValue(CLOCK, new SystemClock());
context.hasValue(CLOCK); // true
const clock = context.getValue(CLOCK);
```

Tokens are preferable to string names: they carry the value's type and avoid
collisions between packages. `getValue` on a name that is not registered throws;
`hasValue` is the guard. Values registered with `setValue` are instance values —
they are not re-created by a scope.

## 2. Registering entries

Most entries are declared in a configuration class. `@configuration` marks the
class as a source; `@entry` marks a method whose return value becomes an entry.
The method name is the entry name unless a token or explicit name is supplied.

```ts
import { configuration, entry } from '@ndigo/context';

@configuration
class AppConfiguration {
    @entry
    clock(): Clock {
        return new SystemClock();
    }

    @entry
    reportService(): ReportService {
        return new ReportService(this.clock());
    }
}
```

Entries are zero-argument factories: they run once when the context is prepared,
and their return value is registered under the method name (or the supplied
token/name). Compose inside the factory method, or return a class to register a
constructor and let the scope strategy create instances lazily. The boot presets
accept an array of configuration classes:

```ts
import { runNodeApplication } from '@ndigo/platform-node';

const app = await runNodeApplication([AppConfiguration], { port: 3000 });
```

A class can also act as its own factory — the **constructor-factory dual
pattern**: register the class and let the container construct it, or register a
factory that returns it. The container does not care which shape produced the
value; both are entries.

## 3. Scopes

Scopes decide **how long an entry lives**. Declare one with a class decorator from
`@ndigo/factory`:

| Scope                 | Lifespan                                                  | Use                            |
| --------------------- | --------------------------------------------------------- | ------------------------------ |
| `singleton` (default) | One instance per factory                                  | Services, configuration, pools |
| `prototype`           | A new instance on every `getValue`                        | Short-lived collaborators      |
| `hash` / route        | One instance per active scope key, torn down at route end | Per-route request state        |
| `refresh`             | Cached until `config:refresh`, then re-created            | Configuration-derived clients  |
| custom                | Whatever the registered `Scope` implements                | App-specific lifetimes         |

```ts
import { singletonScope, prototypeScope, refreshScope, hashScope } from '@ndigo/factory';

@singletonScope
class ConnectionPool {
    /* one per application */
}

@prototypeScope
class RequestContext {
    /* a fresh instance per resolution */
}

@hashScope
class RouteState {
    /* one per active route key */
}

@refreshScope
class FeatureClient {
    /* rebuilt after the environment refreshes */
}
```

`@refreshScope` is the bridge to [guide 03](03-environment-configuration.md): when the environment emits
`config:refresh`, the cached instance is destroyed and the next `getValue`
re-creates it. A custom scope is registered on the factory with
`registerScope(name, scope)`; the scope owns its own cache and
`destroyValue(name)` behavior.

Scope pitfalls:

- A scope decorator belongs on the class, not on the `@entry` method.
- `prototype` entries are not cached, so nothing calls their `destroy`/`close`
  automatically; the caller owns them.
- `hash` scope requires an active key (`HashScope.setCurrentKey`); resolving
  outside a route scope fails loudly.
- `refresh` destroys the old instance; do not hold a reference to it across a
  refresh.

## 4. Aware callbacks

An **aware** entry receives a framework object after construction. The context
runs the aware processors before the entry's `init` hook. The common one is the
application context itself:

```ts
import { AsApplicationContextAware } from '@ndigo/context';
import { Null } from '@ndigo/core';

class ReportService extends AsApplicationContextAware(Null) {
    describe(): string {
        return this.applicationContext?.name ?? 'unbound';
    }
}
```

`NameAware` (from `@ndigo/factory`) receives the value name. The mixins
(`AsApplicationContextAware`, `AsNameAware`, `AsAware`) add the marker symbol and
the setter; implementing the interface directly works too if you set the marker.
Awareness is an integration point, not a service locator: prefer constructor
arguments for ordinary collaborators and use aware callbacks only when the
framework object is genuinely ambient.

## 5. Init, destroy, and smart lifecycle

Four contracts cover the common lifecycle shapes:

| Contract         | Method           | When it runs                                      |
| ---------------- | ---------------- | ------------------------------------------------- |
| `Initializable`  | `init`           | After construction and aware processing           |
| `Destroyable`    | `destroy`        | When the entry is destroyed or the context closes |
| `Closeable`      | `close`          | Same as destroy, for close-shaped APIs            |
| `SmartLifecycle` | `start` / `stop` | On context refresh/close, by phase                |

```ts
import type { Initializable, Closeable, SmartLifecycle } from '@ndigo/factory';

class Pool implements Initializable, Closeable {
    #closed = false;

    init(): void {
        // open connections
    }

    close(): void {
        if (this.#closed) return;
        this.#closed = true;
        // release connections
    }
}

class Heartbeat implements SmartLifecycle {
    readonly isAutoStartup = true;
    readonly phase = 100;
    isRunning = false;

    start(): void {
        this.isRunning = true;
    }

    stop(): void {
        this.isRunning = false;
    }
}
```

`SmartLifecycle` entries start in **ascending** phase order on refresh and stop in
**descending** phase order on close. Use a lower phase for infrastructure that
others depend on and a higher phase for consumers. `isAutoStartup: false` opts
out of automatic start; the context still calls `stop` if the entry is running.

Teardown is idempotent: `destroy`/`close` may run more than once, so guard
the body. The container calls `destroy` when present, otherwise `close`;
implementing both is unnecessary. Async teardown is not awaited by the
synchronous `context.close` — bridge an async resource to a
`Closeable` that drains first (guide 21) or close it explicitly before the
context.

## 6. Parent/child contexts and events

A child context inherits **entry lookups** and shared dependencies from its
parent but keeps its own values, entries, and lifecycle. It also has its **own
environment**: it does not see the parent's property values. Micro-frontend
features use this shape:

```ts
import { GenericApplicationContext } from '@ndigo/context';

const shell = new GenericApplicationContext('shell');
const feature = shell.newChild('catalog');
feature.setValue('catalogTitle', 'Catalog');
shell.hasValue('catalogTitle'); // false — children do not leak upward
feature.getValue('catalogTitle'); // 'Catalog' — local value
```

`children` is plural: a shell normally hosts several features, and a preserved
feature stays alive across navigations. `close()` cascades depth-first through
all of them.

Events are addressed explicitly:

- `context.emit(type, payload)` — local listeners only.
- `context.root.emit(type, payload)` — the shared application-wide channel; the
  root is an ordinary context, so listeners subscribe with `root.on(...)`.
- `context.parent?.emit(type, payload)` — a child notifying its direct owner.
- `for (const child of context.children) child.emit(...)` — an owner notifying
  its direct children.
- `ContextEventGateway` — an allowlisted relay with managed teardown.

Use application events for cross-context notification (a feature mounted, a
configuration refreshed), not for durable work — that is jobs (guide 22) — and
not for local derived state — that is signals (guide 29).
[Guide 31](31-micro-frontends.md) covers the micro-frontend relay wiring, and
[guide 49](49-configuration-layering-and-context-composition.md) covers the
composition and event model end to end.

Closing a context closes its children depth-first, then stops its lifecycle
processor, destroys its entries, and detaches from the parent. `close` is a
safe no-op after the first call.

## 7. Pitfalls

- **Registering an instance with `setValue` bypasses scopes.** It is an
  instance value for the lifetime of the context; use `@entry` for scoped
  entries.
- **Circular constructor dependencies fail at refresh.** Break the cycle with a
  setter/aware callback, a provider method, or a separate collaborator.
- **An entry captured before `refresh` is not initialized.** Resolve entries after
  the context is active; boot presets return the refreshed context.
- **Async cleanup is not automatic.** Bridge to `Closeable` and drain before
  `context.close`.
- **Do not use the context as a global.** Pass it only to infrastructure that
  genuinely needs the container; application services should take their
  collaborators as constructor arguments.

## See also

- [Guide 01 — Building a Node API](01-building-a-node-api.md) — the boot preset that creates the root context
- [Guide 02 — Building a Browser App](02-building-a-browser-app.md) — the browser twin
- [Lifecycle & Resource Ownership](../architecture/lifecycle-and-ownership.md) — the async/resource doctrine
- [Application Context Lifecycle](../reference/2026-08-22_CONTEXT_LIFECYCLE.md) — refresh/close sequences
- [`@ndigo/factory`](../../packages/ndigo-factory/README.md) — scopes, aware mixins, lifecycle contracts
- [`@ndigo/context`](../../packages/ndigo-context/README.md) — the container and environment
