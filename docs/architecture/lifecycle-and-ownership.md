# Lifecycle & Ownership

The async and resource discipline of Ndigo: how the framework manages
initialization and teardown, who owns what, and why the ordering rules are
uniform across every backend. This page states the rules once; the linked
guides cover each surface in detail.

## Design Principles

1. **Async by default.** Every operation that can perform I/O is awaitable,
   including in-memory implementations. There is no hidden synchronous fast
   path with different semantics — one contract per capability.
2. **Memory is the default; backends are explicit.** Installing a backend
   package never connects, never auto-registers entries, and never changes
   auto-configuration. The application opts in.
3. **Ownership is explicit, never ambiguous.** A resource you _created_ is
   **owned** — you close it. An **injected** resource is **borrowed** —
   closing an adapter never closes the injected client unless ownership is
   transferred explicitly. Disposal is idempotent, so disposing one adapter
   never breaks another user of the same client.
4. **Initialization is explicit and fail-loud.** Construction performs no I/O;
   a backend is initialized before use. A failed initialization keeps failing
   on later use rather than falling back to memory or an empty result.
5. **Stop, drain, then close — in `finally`.** Producers and serving stop
   first, consumers unsubscribe, transports close, and the container closes
   last. Cleanup is written so a failure cannot skip the remaining steps.
6. **Teardown is a contract, not a convention.** Container teardown releases
   every managed value through one contract; external adapters bridge their
   own disposal into it explicitly. An object that merely exposes a dispose
   method is not proof that the container will release it.

## Ownership Rules

| Resource            | Created (owned)                        | Injected (borrowed)                                       | Transfer                                                         |
| :------------------ | :------------------------------------- | :-------------------------------------------------------- | :--------------------------------------------------------------- |
| Network connections | Opened from a URL → the owner closes   | Passed into another component → the receiver never closes | Explicit, when the receiver becomes the owner                    |
| Database clients    | Created from configuration → owned     | Supplied ready-made → borrowed                            | On request; disposal leaves the client usable by other consumers |
| Cache managers      | Created from a URL → drains and closes | Built on a ready-made client → borrowed                   | Documented per package                                           |

The rule is uniform: creation carries the obligation to release, injection
carries the obligation to leave the resource usable. Anything else is stated
and tested as an exception.

## Shutdown Ordering

1. Stop producers and serving — stop accepting new work.
2. Unsubscribe consumers and stop background heartbeats; drop sessions.
3. Close the transport fan-out.
4. Close publishers, each by its owner.
5. Close the container synchronously; it releases every managed value in a
   predictable order — destruction processors first, then the values
   themselves.

Every step is awaited where awaitable. A startup failure runs the same cleanup
path, so nothing half-built is left connected.

## Lifecycle Sequences

The application-context lifecycle — refresh, close, destroy versus close, and
child-context propagation — is specified in
[Guide 04 — Injection & Lifecycle](../guides/04-dependency-injection-and-lifecycle.md).
This page covers the resource-ownership half; the two meet where external
disposal is bridged into container destruction, and at the drain-before-close
rule.

## Verification

- The regression suite proves shared-client disposal independence, transfer
  and close-exactly-once, borrowed-client usability after adapter disposal,
  real-file close/reopen durability, and observed SQL failures.
- The cross-node fan-out smoke test proves that a closed publisher is
  rejected, that an inbound fault propagates instead of falling back to local
  delivery, and that closure is idempotent — the rules exercised end to end,
  not just documented.

## See Also

- How-to: [Guide 04 — Injection & Lifecycle](../guides/04-dependency-injection-and-lifecycle.md),
  [Guide 15 — WebSockets](../guides/15-websockets.md),
  [Guide 21 — Persistence & Shared Stores](../guides/21-persistence-and-shared-stores.md)
- Package reference: [ndigo.dev/reference/packages](https://ndigo.dev/reference/packages/)
  for each package's README and its per-surface ownership statement

## When to Revisit

- A backend that cannot fail loudly on initialization — a streaming store or
  an external broker — needs an explicit fault contract before adoption.
- If container teardown grows async lifecycle hooks, the synchronous-close
  rule (principle 6) is the seam to reopen. Until then, bridged disposal and
  drain ordering remain the contract.
