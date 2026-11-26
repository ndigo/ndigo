# AD-112: Lifecycle consolidation — `destroy()` is the single release contract, teardown mirrors construction

**Date:** 2026-11-20
**Status:** Accepted
**See also:** AD-83, AD-109, AD-110, AD-111; #47 (annotation lifecycle)
**Refs:** #548 (this decision), #561 (consumer)

---

## Context

`@ndigo/factory`'s `lifecycle.ts` had grown to nine contracts for roughly four
concepts. #548 recorded the two blocking problems and asked for one release
verb, processor reachability, and a destruction order:

1. **`close()` and `destroy()` were the same operation under two names** — each
   with a sync/async pair — so `@preDestroy` (then the coming annotation, now
   AD-111) would have had to pick a side and cement the split.
2. **`Closeable`-only values never reached `DestructionAwareProcessor`.** The
   destroy path preferred `destroy()` and fell back to a processor-less
   `close()`; scope teardown ran no processors at all.
3. Destruction processors ran in **registration order** — the reverse of what
   "teardown mirrors construction" should mean.

The maintainer's follow-up analysis on the issue added: the `Smart-` and
`LifecycleProcessor` names collide with the `EntryProcessor` family; the word
"lifecycle" carries four unrelated meanings repo-wide (container, ORM entity
hooks, migration pipeline, per-subsystem); and the processor contracts force
no-op stubs because their guards are all-or-nothing.

An audit of the implementer surface settled the verb question: **every
container-managed value is terminal.** No factory-contract implementer can be
reopened; the one genuinely reversible component, `HTTPServer`, deliberately
does _not_ implement the factory contract (its `close()` is the
`ManagedLifecycle` stop path, and `stop()` → `start()` cycles by design).

## Decision

### D-1 — `destroy()` is the single release contract; `Closeable`/`AsyncCloseable` are deleted

`Destroyable`/`AsyncDestroyable` survive as the one release pair. Destruction
is terminal: a destroyed value is never reused, and resolving the entry again
constructs a new instance. The `destroyed: boolean` member leaves the contract
(state is the implementation's affair); `likeDestroyable` keys on the method
alone, like every other `like*` guard.

### D-2 — The terminal reason settles the verb

`close()` connotes a reopenable resource; the container only ever performs the
terminal act, and the reversible axis already has a name — `start()`/`stop()`.
Destroying is also the vocabulary the rest of the surface already speaks:
`destroyValue`, `@preDestroy`, `processBeforeDestruction`, `'context:destroy'`
— AD-111's annotation names and its sequence diagram's "one verb, per #548"
both resolve to `destroy()`.

`close()` survives **only** where it names a genuinely reversible stop/drain —
the platform layer: `HTTPServer.close()` (restartable, tested) and
`@ndigo/platform-node`'s graceful-shutdown `Closable` resources. Those are the
stop/drain phase that runs _before_ the container destroys entries, and are
not destruction contracts. Container-side operation vocabulary
(`destroyValue`, `destroyScopedValue`) also stays: destroying is the
container's act; `destroy()` is the value's side of it.

### D-3 — Teardown mirrors construction

Destruction processors run in **reverse registration order** (the mirror of the
forward order they apply during creation), and managed values are released in
**reverse creation order** (per scope bucket for scoped values): dependents
resolve before the dependencies they use, so dependents release first —
Spring's reverse-dependency intent without maintaining a dependency graph.

### D-4 — Destruction processors reach every managed value, on every release path

`destroyValue`, scope teardown (`RefreshScope.clear()`, `HashScope.endScope()` —
previously processor-less), and the context close cascade all funnel through
one release path: processors run first for the value, then `destroy()` when the
value implements `Destroyable`. A value that implements no release method still
gets its hooks, and `processBeforeDestruction` receives `unknown` — the
declarative destruction hook is never gated on an interface (the consumer is
#561's `@preDestroy`).

### D-5 — Declined: `processAfterDestruction`

The symmetry with initialization does not survive the destroy path: async
destruction is not awaited by the synchronous context close, so an
"after destruction" hook would fire before the resource was actually released
— wrong precisely where it matters. No consumer exists, Spring's
`DestructionAwareBeanPostProcessor` has no such hook, and a `name`-only variant
would be a container/scope-level notification, not an instance hook. Recorded
so it is not re-proposed without the unawaited-async problem being solved.

### D-6 — Per-hook participation in the processor contracts

Each processor hook is optional; the `like*` guards are true when **any** hook
of the group is present, and dispatch calls only the hooks that exist. The
all-or-nothing guards forced stubs — advice's `interception(...)` carried a
no-op `processBeforeInitialization` — and the stubs are retired with the
guards. `processProperties` stays grouped with `ConstructionAwareProcessor`:
it transforms data rather than observing a value, but no consumer warrants a
contract of its own.

### D-7 — Spring-inherited names renamed

`SmartLifecycle` → `ManagedLifecycle` (the `Smart-` prefix was jargon; the
contract is `Lifecycle` + phase + auto-start), `likeSmartLifecycle` →
`likeManagedLifecycle`, `LifecycleProcessor` → `LifecycleCoordinator` (it
drives components; it is not a processor applied to a value, which is what
`EntryProcessor` means) and `DefaultLifecycleProcessor` →
`DefaultLifecycleCoordinator`.

### D-8 — ORM entity hooks are renamed off the word

`@ndigo-orm`'s persistence hooks move to `entity-hooks.ts`:
`runLifecycleHooks` → `runEntityHooks`, `LifecycleEvent` → `EntityHookEvent`,
`LifecycleHookDefinition` → `EntityHookDefinition`, the metadata field →
`entityHooks` and its key `orm:lifecycle` → `orm:entityHook`. Unqualified
"lifecycle" is the container's; the entity family names its concept. (File and
identifier rename only — the hooks' behavior is untouched, and
`@prePersist`-family decorator names were already event-shaped.)

## Rejected alternatives

| Alternative                                                                           | Why not                                                                                                                                                                                                                            |
| :------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Keep both contracts with a documented distinction**                                 | No operational distinction exists: the container never revives an instance. Keeping both re-creates the `@preDestroy`-picks-a-side problem #548 exists to kill.                                                                    |
| **Unify on `close()`**                                                                | The honest contract is the terminal act, and close connotes reopenability the container never has. It would also rename ~13 public APIs whose natural word is the terminal one, against the façade (which keeps `close()` anyway). |
| **Keep `Closeable`/`AsyncCloseable` as declared-but-unused vocabulary**               | Ships a lifecycle contract the framework never consults — the ambiguity returns in a quieter form. When a genuinely reopenable container-managed resource appears, its contract is designed with it.                               |
| **`processAfterDestruction`**                                                         | D-5 — the unawaited-async problem.                                                                                                                                                                                                 |
| **Rename the container-side operation vocabulary** (`destroyValue` → `closeValue`, …) | Entry destruction is the container's act; the value contract was what needed unifying. Kept per the issue's guidance to change only what the distinction requires.                                                                 |

## Consequences

- **Public break, pre-1.0, no aliases**: `Closeable`/`AsyncCloseable` and
  `likeCloseable` are gone; ~13 classes rename `close()` → `destroy()`
  (redis, jobs, locks, scheduler, orm-drizzle session store, socket-session
  registry); `SmartLifecycle`/`LifecycleProcessor` renamed; ORM identifiers
  renamed. The API trees regenerate on demand.
- **`@preDestroy` (#561) now has its seam**: any managed value on any release
  path, before its release.
- **Docs updated**: guide 04 §5 (contracts, ordering, init-vs-start), the
  lifecycle-and-ownership page (destruction contract + the two-layer note),
  the annotation-model page (names resolved), ARCHITECTURE.md, STYLE_GUIDE.
  AD-111 D9 is resolved by this record.
- **Revisit triggers**: a genuinely reopenable container-managed resource
  appears → design the close-shaped contract with it (today close lives in the
  platform stop/drain layer); a real dependency topology proves
  reverse-creation wrong → evaluate dependency-ordered teardown.

## Refs

- #548 — this decision; #561 — the annotation consumer; #47/AD-111
- `packages/ndigo-factory/src/{lifecycle.ts,entry-processor.ts,abstract-factory.ts,scope.ts}`
- `docs/guides/dependency-injection-and-lifecycle.md`,
  `docs/architecture/{lifecycle-and-ownership,annotation-and-transformer-model}.md`
- `packages/ndigo-orm/src/entity-hooks.ts`,
  `packages/ndigo-orm/src/metadata.ts`
