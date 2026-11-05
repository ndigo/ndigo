# AD-59: Signals — `@ndigo/reactive` modernized into `@ndigo/signals` on `@preact/signals-core`

**Date:** 2026-09-01
**Status:** Accepted — implemented; `@ndigo/signals` shipped and
`@ndigo/reactive` retired.

## Context

`@ndigo/reactive` was a pull-based observable layer (Knockout/Backbone style:
`mutableModel` with `.get()/.set()/.subscribe()`). It had no automatic
dependency tracking (`DerivedModel` required explicit source arrays), manual
subscription cleanup (`Unsubscribe` returns leaked memory), opt-in batching,
and a verbose `.get()/.set()` read/write surface. The framework needed
push-based reactive state that integrates with Ndigo's TC39-decorator + context
hierarchy patterns.

## Evidence

- `packages/ndigo-signals/src/index.ts` re-exports the engine:
  `export { signal, computed, effect, batch, untracked, Signal } from
  '@preact/signals-core'` (plus `streamToSignal`, `eventsToSignal`,
  `signalToEvents`). First git entry: `d7f93e84` (2026-09-01).
- Ndigo decorator layer: `packages/ndigo-signals/src/_decorators.ts` implements
  `@signal`/`@computed`/`@effect` field/method decorators over
  `@preact/signals-core` (`signalMap`, `computedMap`, `effectDisposers`
  WeakMaps; a `@reactive` class decorator activates pending metadata),
  exported via `packages/ndigo-signals/src/decorators/index.ts`.
- `packages/ndigo-signals` depends on `@preact/signals-core` (plan §6 pinned
  `^1.8.0`).
- `@ndigo/reactive` is **gone** (`ls packages/` has no `reactive` entry) —
  the migration path's final phase (retire the old package) completed.

## Decision

- **D-1** Build `@ndigo/signals` on `@preact/signals-core` (re-export
  `signal`/`computed`/`effect`/`batch`/`untracked`), not SolidJS,
  `@vue/reactivity`, or RxJS — Preact's is the smallest, framework-agnostic,
  non-Proxy signals implementation (plan §2).
- **D-2** Value-add over the thin re-export is a TC39-decorator API:
  `@signal` (field), `@computed` (getter), `@effect` (method, instance-scoped
  auto-disposal), `@batch` (method) — declarative reactive state usable from
  framework classes.
- **D-3** Keep the model adapter so signals implement
  `ReadableModel`/`WritableModel` (bridge for `@ndigo/view-webcomponent`
  `bindModel`); new package + deprecation path rather than an in-place rename,
  to avoid a synchronized break of `@ndigo/generators` and view consumers
  (the plan explicitly rejected rename-in-place).
- **D-4** Signals are plain values — a `signal(obj)` proxy for deep
  reactivity was rejected (deep data lives in `@ndigo/model`/Zod schemas);
  `effect()` may be suppressed in server context (SSR-safe).

## Consequences

- Framework state becomes push-based with automatic dependency tracking and
  microtask-batched propagation, replacing pulled `DerivedModel` graphs and
  manual `Unsubscribe` bookkeeping.
- Two later decisions build on it: AD-09's SSE push delivers server model
  updates into `@ndigo/signals` local reactive state, and AD-19's locale
  reactive switching uses `@ndigo/signals` (which "re-exports
  `@preact/signals-core`"); the WebSocket status tracking in AD-22 is a
  client-signal consumer.
- `@ndigo/reactive` retired; no re-export shim remains.

## References

- Plan: `docs/plans/2026-09-01_SIGNALS.md`
- Implementation: `packages/ndigo-signals/src/index.ts`,
  `packages/ndigo-signals/src/_decorators.ts`,
  `packages/ndigo-signals/src/decorators/index.ts`, commit `d7f93e84` (2026-09-01)
- Related: [AD-09](2026-09-05_AD09_SERVER_PUSH.md),
  [AD-19](2026-09-13_AD19_CONTENT_I18N.md),
  [AD-22](2026-09-15_AD22_WEBSOCKET_CLIENT.md)

## Revisit Trigger

Revisit if a consumer needs deep (proxy-based) reactive objects that
`@preact/signals-core`'s top-level `.value` model cannot express, or if a
value-semantics update to the decorator lifecycle is required by a new
component framework binding. Otherwise the `@ndigo/signals` primitives stand.
