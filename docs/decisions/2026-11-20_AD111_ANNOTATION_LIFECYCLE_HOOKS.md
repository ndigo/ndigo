# AD-111: Annotation lifecycle hooks front the processor seam, not `SmartLifecycle`

**Date:** 2026-11-20
**Status:** Accepted
**See also:** AD-83 (D5), AD-109, AD-110; #548
**Refs:** #47 (this decision), #548 (prerequisite and implementation gate)

---

## Context

AD-83 D5 recorded a deliberate divergence: the interface-first lifecycle —
`SmartLifecycle`, `Initializable`, `Closeable`/`Destroyable` — is the supported
path, and annotation-based lifecycle hooks (the Spring `@PostConstruct` /
`@PreDestroy` arc) were parked as "a possible future _addition_ beside it — a
feature conversation, not a naming oversight." #47 is that conversation.

The annotation work that followed (#545/#546, AD-109, AD-110) reframed it
around three findings.

1. **The consumption model is settled: two seams.** A declaration reaches its
   consumer either through a **processor** — a hook on each instance as the
   container creates it (`@ndigo/factory` `entry-processor.ts`) — or through a
   **lifecycle** component that scans the finished graph on refresh
   (`SmartLifecycle`). Lifecycle hooks are per instance by nature, so only the
   processor seam can carry them.
2. **The processor seam already declares both post-injection hook shapes.** In
   the factory's creation sequence, the moments the Spring annotations occupy
   already exist:

    | Spring arc       | Existing hook                                             | Semantics                                                    |
    | :--------------- | :-------------------------------------------------------- | :----------------------------------------------------------- |
    | `@PostConstruct` | `InitializationAwareProcessor.processAfterInitialization` | after construction, property population, and aware injection |
    | `@PreDestroy`    | `DestructionAwareProcessor.processBeforeDestruction`      | before the value is released                                 |

    `DestructionAwareProcessor` has no production implementation today — this
    work would be its first — and the initialization hook's only container
    consumer is advice weaving.

3. **#548 gates the destruction half.** The factory has two resource-release
   verbs (`close`/`destroy`, with the destroy path as an `else if`), a
   `close`-only value never reaches `processBeforeDestruction`, and scope
   teardowns run no processors at all. One reachable release seam must exist
   before `@preDestroy` can attach; #548 owns it.

What remained was the question this record answers: do the annotation forms
join `SmartLifecycle` (and how do they interleave with init/refresh/close), or
is the interface path the only supported one?

## Decision

The annotations exist beside the interfaces, and they compile into the existing
processor hooks — there is no parallel engine. The family is
`@preInit`/`@postInit`/`@preDestroy`, and it does not touch `SmartLifecycle`.

### D1 — Accepted, gated on #548

Annotation lifecycle hooks are accepted as a future addition, implemented after
#548 unifies the release verb and makes destruction processors reachable. The
work is not part of the pre-1.0 freeze — it is additive whenever it lands
(AD-91 D5) — and is tracked in its own issue. Nothing changes in the container
until that implementation lands; the interface path (`Initializable`,
`Closeable`/`Destroyable`, `SmartLifecycle`) remains primary and unchanged.

### D2 — They do not join `SmartLifecycle`, and nothing joins refresh

`SmartLifecycle` is a whole-graph, phase-ordered start/stop driven by context
refresh and close. The annotation hooks are per instance, at the factory's
creation and release moments: scoped instances (refresh/hash scopes) are
created and released between refreshes, so a refresh-driven driver can neither
see them nor order them, and phases order components relative to each other,
not instances relative to construction. Refresh keeps exactly one path — the
lifecycle seam — and annotations are not on it.

### D3 — One annotation per post-injection hook, at the hook's exact position

```
processBeforeConstruction → new → processAfterConstruction → population → aware injection
    → processBeforeInitialization   (@preInit)
    → init() [Initializable]
    → processAfterInitialization    (@postInit)
    … the instance is served …
    → processBeforeDestruction      (@preDestroy)
    → close()/destroy()  [one verb, per #548]
```

| Annotation    | Processor hook                                             | Runs                                                           |
| :------------ | :--------------------------------------------------------- | :------------------------------------------------------------- |
| `@preInit`    | `InitializationAwareProcessor.processBeforeInitialization` | after property population and aware injection, before `init()` |
| `@postInit`   | `InitializationAwareProcessor.processAfterInitialization`  | after `init()`, before the instance is served                  |
| `@preDestroy` | `DestructionAwareProcessor.processBeforeDestruction`       | before the unified release verb (#548)                         |

The JSR-250/Spring mapping is recorded for migration: `@PostConstruct` lives at
the `@preInit` position — its definition, "after dependency injection is done",
is exactly the post-injection, pre-`init()` moment — `@PreDestroy` at
`@preDestroy`, and `@postInit` has no Spring twin.

### D4 — No `@postConstruct`; `processAfterConstruction` stays interface-only

`processAfterConstruction` runs after the constructor but **before property
population and aware injection** — it is the gate that decides whether
population happens at all — and its contract is documented as mainly internal
("the ideal callback for performing custom field injection"). A method hook
named `@postConstruct` there would carry the JSR-250 name with the opposite
readiness guarantee: a migration trap for a moment with little user-code value.
The absence is deliberate; the annotation is additive later if demand appears —
the post-DI moment users expect from `@postConstruct` already has a name in this
family, `@preInit`.

The same reasoning leaves no twin for `processBeforeConstruction` (no instance
exists to call a method on; constructor interception is rejected — AD-42 D-7)
and none for `processProperties` (a descriptor-map transformation, not an
event).

### D5 — `@preInit` is a position, not a stage

`@preInit` fronts the existing `processBeforeInitialization` hook; the factory
sequence gains no step. This closes the concept doc's open question — "is
`preInit` a real lifecycle stage, or covered by existing hooks?" — as
**covered**. The HTTP interceptor's `preInit(url, settings)` remains the only
request-stage `preInit`: a different receiver with a different contract, and
the annotation spelling matches the category-5 form.

### D6 — Method shape and failure posture

Lifecycle methods take no arguments, their return value is ignored, and they
are synchronous: the processor hooks are synchronous, and async release remains
an interface concern (`AsyncCloseable` bridging; guide 04 §5). A
`@preInit`/`@postInit` failure propagates like an `init()` failure — fail-loud,
a half-initialized instance is never served. A `@preDestroy` failure follows
the container's teardown error isolation (one entry's destroy failure does not
strand the rest).

### D7 — `@preDestroy` is reachable on every release path

Every path that releases a managed value runs the destruction processors:
`destroyValue` (both release verbs, after #548 unifies them), scope teardown
(`RefreshScope.clear()` / `HashScope.endScope()`, which bypass processors
entirely today), and context close including the child cascade. "Before
destruction" cannot have paths a user cannot see; closing these gaps is part of
#548's scope, not a follow-up.

### D8 — The executor is container-registered, after the aware processor

One processor, implementing the initialization- and destruction-aware hooks,
appended by the context the way `ApplicationContextAwareProcessor` is
(`generic-application-context.ts`, `_prepareFactory`), after application
processors. The position is part of the decision, not an accident: `@preInit`
sees a fully injected instance; `@postInit` runs at the same point as advice
weaving, so advice applies to the annotated method like any other call;
`@preInit`/`@preDestroy` sit outside weaving. Standalone `new` instances remain
inert — the declaration layer's existing contract — and advice stays
application-wired because its rules are application-composed, while lifecycle
declarations are not inputs the application assembles.

### D9 — Destruction ordering and the release verb stay #548's decisions

The annotations attach at `processBeforeDestruction` and inherit whatever #548
pins (one verb, ordering, reachability). This record fixes the attachment
point, not the order; #47 does not preempt #548's acceptance criteria.

### D10 — Category 5 spans two lifecycles; the event names which

AD-83's "Lifecycle hooks" category covers the entity persistence family
(`@prePersist`/`@postLoad`/`@preUpdate`/`@postRemove`, consumed by the ORM
entity manager — AD-56) and the container family
(`@preInit`/`@postInit`/`@preDestroy`). The event names the lifecycle —
persistence, container — and the category description and its STYLE_GUIDE §3.17
twin now say so. ORM's hooks are explicitly out of scope here: they are a
different lifecycle with a different executor, and their user-facing
documentation gap is its own item.

## Rejected alternatives

| Alternative                                                                          | Why not                                                                                                                                                                                 |
| :----------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Join `SmartLifecycle`**                                                            | D2 — different clock and scope; a refresh-driven driver cannot order per-instance add/remove, and scoped instances never appear at a refresh boundary.                                  |
| **Full hook mirror, including `@postConstruct`**                                     | D4 — the name collides with JSR-250's post-DI meaning at a pre-injection position; additive later if demand appears.                                                                    |
| **JSR-250 names only** (`@postConstruct` at the `@preInit` position + `@PreDestroy`) | Name and position stop corresponding to the hook vocabulary, and the post-`init()` moment would have no name; the migration mapping carries the Spring meaning instead.                 |
| **Application-wired executor** (`processors(...)`, as advice)                        | The executor has no application inputs; requiring wiring is ceremony that fails closed. Advice's rules are application-composed, which is why it stays explicit.                        |
| **A parallel lifecycle engine**                                                      | The two-seam model and the existing hooks already cover the need; the in-repo precedent is the opposite — ORM's `@prePersist` family is consumed by the `EntityManager`, not an engine. |

## Consequences

- **Inert until implemented.** No container behavior changes with this record;
  the interface path is untouched.
- **Implementation lands after #548** in its own issue, and the annotations are
  additive whenever they land (AD-91 D5).
- **Documentation lands with the implementation**: guide 04 §5 gains the
  annotation table and the Spring mapping, the annotation-model page's executor
  examples and the category-5 member lists gain the names, and the AD-83/STYLE
  rows list the container family.
- **AD-83 D5's hedge is resolved**: "possible future addition" becomes a
  decided addition, recorded here rather than re-litigated.
- **Revisit triggers:** if #548 lands without a processor-reachable release
  seam or with an async release verb, D6/D7 reopen; if `@postConstruct` demand
  appears, it is additive; if the executor's cost outweighs its value in use, a
  rejection can be recorded then.

## Refs

- #47 — this decision; #548 — prerequisite and implementation gate
- [AD-83](2026-10-31_AD83_DECORATOR_CATEGORIES.md) D1 category 5, D5
- [AD-109](2026-11-19_AD109_ANNOTATION_ADVICE_MODEL.md),
  [AD-110](2026-11-20_AD110_ANNOTATION_EXECUTION_RUNTIME.md)
- `docs/architecture/annotation-and-transformer-model.md` — "Choosing a
  consumption seam"
- `docs/guides/04-dependency-injection-and-lifecycle.md` §5
- `packages/ndigo-factory/src/{lifecycle.ts,entry-processor.ts,abstract-factory.ts}`
- `packages/ndigo-context/src/application-context-aware-processor.ts`,
  `generic-application-context.ts` (`_prepareFactory`)
