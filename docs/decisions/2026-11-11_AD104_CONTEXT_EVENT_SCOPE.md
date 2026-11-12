# AD-104: Context events are hub-and-spoke, not tree-wide

**Date:** 2026-11-11
**Status:** Accepted (2026-11-11) — removes `bubble`, `broadcast`, and the unused
deep-traversal helpers before the 1.0 freeze. Implementation tracked in #437.

## Context

`ApplicationContext` is both a DI container and an `EventEmitter`. It also
models a tree through `parent`, `children`, `root`, and `path`. Two convenience
methods turned that tree into an event-routing topology:

- `bubble(type, ...data)` emitted on the origin and then recursively on every
  ancestor.
- `broadcast(type, ...data)` emitted on the origin and then recursively on every
  descendant.

Both are inclusive and recursive. `broadcast` on a leaf emits on the leaf; a
deep tree fans out to every level. The same tree assumption produced
`traverseToRoot`, `traverseSubtree`, `findAncestor`, and `findDescendants`.

That model does not match how Ndigo composes applications:

- The shell/platform root has direct app or feature children; a shell normally
  hosts several features at once (the host demo mounts three), and `preserve`
  keeps them alive across navigation.
- Micro-frontend isolation is built on **explicit** relays:
  `ContextEventGateway` carries an allowlisted source→target mapping and
  `destroy()` detaches every subscription. The 2026-03-24 routing architecture
  plan already states that feature events do not leave the feature unless
  explicitly relayed.
- No runtime code calls `bubble`, `broadcast`, or the four traversal helpers.
  Only context specs and documentation reference them.
- The 1.0 freeze (AD-91) is the last window for a hard cut without aliases
  (AD-91 D4).

## Decision

**D-1 — Events are local by default.** `context.emit(type, ...data)` notifies
listeners on that context only. There is no implicit propagation.

**D-2 — Cross-context events are addressed explicitly.**

- `context.root.emit(...)` is the shared application-wide channel; listeners
  subscribe with `root.on(...)`.
- `context.parent?.emit(...)` targets the direct owner.
- Iterating `context.children` targets the direct children.
- `ContextEventGateway(source, target, relays)` is the managed, allowlisted
  path for feature isolation and automatic teardown.

**D-3 — Hard-remove the tree-wide API.** Delete `bubble` and `broadcast` from
`ApplicationContext` and `GenericApplicationContext`, and delete
`traverseToRoot`, `traverseSubtree`, `findAncestor`, and `findDescendants` from
`@ndigo/context`. No aliases or deprecation shims; the repository has no
external consumers yet (AD-91 D4).

**D-4 — Keep `children` plural.** A shell/platform root may host several apps
or features. There is no singular `child` accessor and no `emitToChildren`
helper; the explicit loop is the API.

**D-5 — Keep the gateway contract unchanged.** `ContextEventGateway`,
`createFeatureContext`, and `unmountFeatureContext` keep their shapes. The
gateway remains the answer when a relay needs lifecycle management or namespace
validation.

## Options considered

| Option                                     | Assessment                                                                                              |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Keep `bubble`/`broadcast` as-is            | Preserves an event model the architecture does not use; hides scope and keeps dead public surface.      |
| Deprecate with aliases                     | AD-91 D4 rejects alias debt pre-1.0; the repo has no external consumers to migrate.                     |
| Add `emitUp`/`emitDown`                    | Still encodes tree direction and depth; the root/parent/children addresses are clearer.                 |
| Add a dedicated `ContextEventHub` class    | Duplicates the context emitter and adds a DI token; `root` already provides the shared channel.         |
| **Remove the tree-wide API (this record)** | **Leaves local `emit` plus explicit addressing; matches the shell/feature topology; smallest surface.** |

## Consequences

Positive: the public API stops implying deep trees; every cross-context event
has a visible source and target; the traversal helpers and their tests go away.
`ContextEventGateway` remains the only managed relay path.

Negative: a feature subscribing to `root` must remove its listener on close
(`on()` returns the emitter, not a disposer); `ContextEventGateway` is the
managed alternative. A future multi-level notification must be written as an
explicit walk in application code rather than a method call.

## Revisit Trigger

A real consumer needs multi-level propagation. If that happens, add an explicit
traversal utility (or a dedicated event hub with managed subscriptions), not
recursive methods on `ApplicationContext`. Re-open only with that concrete
consumer shape.

## References

- AD-91 — the 1.0 API freeze and the no-alias position.
- #437 — implementation.
- [Guide 49 — Configuration Layering & Context Composition](../guides/49-configuration-layering-and-context-composition.md)
  — the composition and event patterns.
- `docs/plans/2026-03-24_SCALE2_CONTEXT_ROUTING_ARCHITECTURE.md` — the explicit
  feature relay model.
