# Lifecycle & Ownership

Every resource in an Ndigo application has one owner. **If you create it, you
destroy it; if it is injected, you borrow it.** That single rule decides who
closes a connection, when it closes, and why destroying one component cannot
break another that shares the same client.

It is deterministic cleanup — the boundary [RAII][raii] draws in systems
languages, expressed through an object graph instead of lexical scope.

## Owned vs Borrowed

| Resource            | Created (owned)                        | Injected (borrowed)                                       | Transfer                                                         |
| :------------------ | :------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------- |
| Network connections | Opened from a URL → the owner closes   | Passed into another component → the receiver never closes | Explicit, when the receiver becomes the owner                    |
| Database clients    | Created from configuration → owned     | Supplied ready-made → borrowed                            | On request; disposal leaves the client usable by other consumers |
| Cache managers      | Created from a URL → drains and closes | Built on a ready-made client → borrowed                   | Documented per package                                           |

The default is ownership: a resource built from configuration belongs to its
creator. Passing a ready-made client transfers nothing unless the receiver is
explicitly told to take it. Disposal is idempotent, so a double destroy cannot
take down a client someone else is still using.

```typescript
import { LibSQLSessionStore } from '@ndigo/orm-drizzle';

// Owned: the store creates the client from the URL and destroys it.
const owned = new LibSQLSessionStore({ url: 'file:./data.db' });

// Borrowed: destroy() leaves the application's client open.
const borrowed = new LibSQLSessionStore({ client, ownsClient: false });
```

## Lifecycle Contracts

The container drives four contracts, and the platform adds one of its own:

| Contract            | Method               | Runs                                         | Awaitable    |
| :------------------ | :------------------- | :------------------------------------------- | :----------- |
| `Initializable`     | `init()`             | once, after construction and aware injection | no           |
| `Destroyable`       | `destroy()`          | on entry destroy or context close            | no           |
| `AsyncDestroyable`  | `destroy(): Promise` | called by the container, but not awaited     | caller waits |
| `ManagedLifecycle`  | `start()` / `stop()` | on refresh / close, in phase order           | no           |
| Platform `Closable` | `close(): Promise`   | during the graceful drain, before close      | yes          |

`Initializable` is one-shot setup; `ManagedLifecycle` is the reversible
start/stop phase, and stopping is not destruction. `@preInit`, `@postInit`, and
`@preDestroy` declare the same hook positions on a method.

Two layers behave differently, and it matters at shutdown:

- **Container teardown is synchronous.** `context.close(): void` closes child
  contexts first, stops running `ManagedLifecycle` targets in descending phase
  order, then destroys values in reverse creation order. `AsyncDestroyable` is
  called, but its promise is not awaited — await it yourself before closing, or
  register the resource with the platform drain.
- **Platform drain is awaitable.** `HTTPServer.close()` and the resources
  passed to `gracefulShutdown` return promises and are awaited, in order, before
  the context is closed.

## Design Principles

1. **Explicit ownership.** Creation carries the obligation to release;
   injection carries the obligation to leave the resource usable. Anything else
   is stated and tested as an exception.
2. **Construction is not I/O, and initialization fails loudly.** A constructor
   wires dependencies; opening connections is an explicit step. A backend that
   cannot start keeps failing on later use instead of falling back to memory or
   an empty result.
3. **Stop, drain, then destroy.** Stop accepting work first, drain what is in
   flight, close transports, and destroy the container last. A startup failure
   runs the same cleanup path, so nothing half-built stays connected.
4. **One release contract.** Every managed value is released through
   `Destroyable.destroy()`. Destruction hooks run first, then the value itself.
   Exposing some other dispose method is not proof that the container will
   release it.

Backends follow the same doctrine: installing a backend package never connects,
never auto-registers entries, and never changes auto-configuration. The
application opts in, and memory remains the default.

## Shutdown Ordering

1. Stop producers and serving — stop accepting new work.
2. Unsubscribe consumers and stop background heartbeats; drop sessions.
3. Close the transport fan-out.
4. Close publishers, each by its owner.
5. Close the container; it stops managed components and destroys values in
   reverse creation order.

The platform presets run this sequence for you.

Node — `close()` awaits the server and any extra resources, then closes the
context. `SIGINT` and `SIGTERM` are wired by default:

```typescript
import { createNodeApplication } from '@ndigo/platform-node';

const app = await createNodeApplication([AppConfiguration], { port: 3000 });
await app.close();
```

Pass `shutdown: false` when a host owns signal handling, or `resources` to
close additional transports between the server and the context.

Browser — `destroy()` releases the router, the view target, and the context:

```typescript
import { createWebApplication } from '@ndigo/platform-web';

const app = await createWebApplication([AppConfiguration]);
app.destroy();
```

## Where to Go Next

- [Injection & Lifecycle](../guides/dependency-injection-and-lifecycle.md)
  — the container, scopes, and every lifecycle hook.
- [WebSockets](../guides/websockets.md) and
  [Persistence & Shared Stores](../guides/persistence-and-shared-stores.md)
  — ownership across sockets, caches, and databases.
- [STOMP & Cross-Node Fan-Out](../guides/stomp.md) — stop and
  drain ordering across nodes.
- [Reference → Packages](https://ndigo.dev/reference/packages/) — each
  package's per-surface ownership statement.
- [Kubernetes pod termination][k8s-termination] and Node.js
  [`server.close()`][node-close] — the standard graceful-shutdown shapes Ndigo
  follows.

[raii]: https://en.wikipedia.org/wiki/Resource_acquisition_is_initialization
[k8s-termination]: https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination
[node-close]: https://nodejs.org/api/http.html#serverclosecallback
