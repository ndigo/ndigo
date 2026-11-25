# Lifecycle & Ownership — Design Notes

Internal notes for maintainers. The published
[Lifecycle & Ownership](./lifecycle-and-ownership.md) page states the rules;
this file keeps the test evidence, the reasoning behind the sync/async split,
and the open questions. It is not published as a concept page.

## Verification

- The regression suite proves shared-client disposal independence, transfer
  and close-exactly-once, borrowed-client usability after adapter disposal,
  real-file close/reopen durability, and observed SQL failures.
- The cross-node fan-out smoke test proves that a closed publisher is
  rejected, that an inbound fault propagates instead of falling back to local
  delivery, and that closure is idempotent — the rules exercised end to end,
  not just documented.

## Why container close is synchronous

`context.close(): void` is terminal and synchronous by design. It closes child
contexts, stops running `ManagedLifecycle` targets in descending phase order,
and destroys managed values in reverse creation order. `AsyncDestroyable` is
recognized, but the returned promise is not awaited; an "after destruction"
hook would therefore fire before the resource was actually released, so none
exists.

The awaitable half lives in the platform layer: `HTTPServer.close()`,
`gracefulShutdown`'s `Closable` resources, and `createNodeApplication().close()`
all return promises and run before the container is destroyed. An application
that owns an `AsyncDestroyable` must await it itself or register it with that
drain.

Reopening this split means giving the container an async close contract and
revisiting every caller, including the browser preset's synchronous
`destroy()`.

## Open question: `Symbol.dispose`

The container recognizes `Destroyable` only. There is no `Symbol.dispose` or
`Symbol.asyncDispose` handling anywhere in `packages/` or `apps/`, and the
TypeScript target does not include the disposable lib.

Tracked in issue #783 with four options: document the contrast only; add an
explicit `toDestroyable(...)` bridge; recognize `Symbol.dispose` implicitly in
the release path; or close as wontfix. Implicit recognition would change the
single-release-contract rule and needs its own decision record. Async disposal
cannot be awaited by `context.close()` without reopening the question above.

## Profile of a safe adapter

- Constructors capture configuration and create handles, never connections.
- Initialization is explicit and fail-loud; a failed backend keeps failing.
- Owned clients destroy exactly once; borrowed clients stay usable.
- `destroy()` is idempotent and does not throw on a second call.
- Async release is either awaited by the caller or registered with the
  platform drain.

## When to Revisit

- A backend that cannot fail loudly on initialization — a streaming store or
  an external broker — needs an explicit fault contract before adoption.
- If container teardown grows async lifecycle hooks, the synchronous-close
  rule is the seam to reopen. Until then, bridged disposal and drain ordering
  remain the contract.
- If issue #783 lands an implicit `Symbol.dispose` fallback, update the
  published page, Guide 04, and the release-path tests together.
