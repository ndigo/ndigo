# AD-105: View targeting strategy — targeters choose the destination, resolvers choose the representation

**Date:** 2026-11-13
**Status:** Accepted — implemented; `ndigo-views` demonstrates centralized
placement, `ndigo-hello` the decentralized contrast.

## Context

AD-65 established that controllers return view **names** and the resolver chain
owns the name → `View` lookup. It explicitly deferred the target family
(D-7: `supportsTarget` / `TargetingViewEngine`), leaving `ViewTarget` as a
single context entry (`VIEW_TARGET`) read once per render.

That one-entry model has three consequences:

1. **One destination per app.** Multi-region browser layouts (shell + sidebar +
   footer) cannot be expressed without every view hard-coding its host or every
   controller constructing its own target — the opposite of AD-65's
   name-returning contract.
2. **No placement policy.** Selecting a destination by view name, route, or a
   route attribute is per-app glue today; there is no ordered, testable place to
   put that policy.
3. **Two render pipelines.** `NodeDispatcher.render` re-implements
   resolution/activation/destruction from `AbstractDispatcher.render`, so every
   renderer fix has to land twice — and the Node copy hard-codes
   `HTTPResponseViewTarget` at the exact point the web copy reads `VIEW_TARGET`.

At the same time, fully centralizing placement would tax the decentralized
model: apps that return a realized view (app 01, SSE transports, captured test
buffers) should not pay for a resolver or targeter chain they never use.

## Evidence

- `packages/ndigo-dispatcher/src/dispatcher.ts` — `AbstractDispatcher.render`
  reads `VIEW_TARGET` once and renders; `#resolvedViews` (WeakSet) tracks
  resolver-owned views for destruction exemption.
- `packages/ndigo-platform-node/src/node-dispatcher.ts` — pre-change: a
  parallel render pipeline with its own view resolution, active-view tracking,
  and `HTTPResponseViewTarget` construction.
- `packages/ndigo-view/src/view-resolver.ts` — `ViewResolverComposite`
  (ordered, first non-`null` wins, `no-await-in-loop`), `BoundedCache`.
- `packages/ndigo-view/src/view-target.ts` — `ViewTarget` with
  `prepare`/`commit`/`clear`; no structural guard existed.
- `packages/ndigo-view-webcomponent/src/engine.ts` — `DOMElementViewTarget`,
  `ShadowRootViewTarget`, `IframeViewTarget`; three DOM target implementations
  with no shared selector/caching layer.
- `packages/ndigo-core/src/path-matcher.ts` — `PathMatcher` /
  `URLGlobPathMatcher`, the matcher `AbstractHandlerMapping` and route
  conditions already use.
- `apps/08-ndigo-views` — three resolvers behind one composite; a
  multi-region layout is the natural demo for placement policy.
- Plan: `docs/plans/2026-11-13_VIEW_TARGETING_STRATEGY.md`.

## Decision

- **D-1** A new `ViewTargeter` contract in `@ndigo/view` mirrors
  `ViewResolver`: `resolveViewTarget(context): ViewTarget | Promise<ViewTarget> | null`,
  where `null` means **decline**, exactly like `resolveViewName`. The context is
  `ViewTargetingContext { route, viewName, view, model, language }`. Targeters
  choose **destination**, never representation; resolvers keep negotiation.
- **D-2** An ordered `ViewTargeterComposite` and a `FixedViewTargeter` live
  beside the contract. `likeViewTarget` (structural: `prepare`/`commit`/`clear`)
  validates runtime-supplied targets.
- **D-3** Dispatcher precedence is strict and short-circuiting:
  `ModelAndView.viewTarget` → `route.attributes[VIEW_TARGET_ATTRIBUTE]` → the
  `viewTargeters` chain (first non-`null`) → the platform fallback
  (`getFallbackViewTarget(route)`). Steps 1–2 are validated with
  `likeViewTarget`; a non-target value is ignored and logged, never passed to a
  selector lookup. Step 3 does not allocate a context and does not run when the
  chain is empty.
- **D-4** `VIEW_TARGET` keeps its exact meaning: the **fallback** destination.
  Base default chain is `[]` (opt-in). The browser preset installs no targeters
  (its root `DOMElementViewTarget` stays the fallback); Node installs
  `[ResponseViewTargeter]` from `NodeAutoConfiguration` as an
  `@entry('viewTargeter')`, preserving the old behavior.
- **D-5** The chain comes from the context: `viewTargeters` (array) beats
  `viewTargeter` (single) beats the platform default. The mixin propagates the
  application context to installed targeters that implement
  `setApplicationContext`, so lazily created DOM targets can bridge events.
- **D-6** `@ndigo/view-webcomponent` ships `SelectorViewTargeter` (selector
  function + `element`/`shadow`/`iframe` mount, cached `selector + mount` →
  target) and `NameViewTargeter` / `RouteViewTargeter` /
  `AttributeViewTargeter` on top. `RouteViewTargeter` uses
  `PathMatcher`/`URLGlobPathMatcher` from `@ndigo/core`. `idSelector` gives the
  safe convention form (`view "hello"` → `CSS.escape`d `#hello`); map-form
  `NameViewTargeter` treats the name as a lookup key, never selector text. A
  throwing selector function or malformed selector is caught, logged at debug,
  and declined; a missing or `isConnected`-false host is a miss.
- **D-7** Target ownership: the targeter owns what it creates and destroys it
  (`BoundedCache.onEvict`, `destroy()` → `clear()`), the dispatcher never calls
  `clear()`/`destroy()` on a target, `ResponseViewTargeter` returns a fresh
  per-request target, and `createWebApplication.destroy()` destroys the
  installed targeters.
- **D-8** The Node pipeline collapses onto the shared one. `AbstractDispatcher`
  gains `getFallbackViewTarget(route)`, `renderDocument(view, model, route)`,
  and `getNegotiationRequest(route)`; `NodeDispatcher.render` becomes "platform
  results first (`ResponseEntity`, bare `ProducerView`, JSON, `ModelAndView`
  without a view), then `super.render`". Platform results never construct a
  target or consult the chain.
- **D-9** Both placement models are supported and **documented as equal
  choices**: centralized (handler returns a name; configuration places it) and
  decentralized (handler returns a realized view and/or an explicit target).
  The fast paths make the decentralized choice cheap: a realized view skips the
  resolver chain, an explicit target skips the targeter chain. `ModelAndView`
  makes a realized view authoritative (`viewName = null`) and its
  `hasView` requires a non-empty name or a non-null view.
- **D-10** AD-65 D-7's engine split (`supportsTarget` /
  `TargetingViewEngine`) **stays deferred**. `ViewTargetingContext` is shaped so
  a future `supportsTarget(context)` can be added without breaking targeters;
  today a targeter declines instead.

## Consequences

- **Positive.** Multi-region layouts become configuration: name/route/attribute
  targeters, ordered, first-match-wins. Controllers stay DOM-unaware. The
  resolver and targeter chains are independently testable. Node and browser run
  one render pipeline, so fixes land once. Node tests can redirect output with
  `ModelAndView.viewTarget` instead of forking the dispatcher.
- **Positive.** The decentralized model is not taxed: no chain allocation when
  none is configured, no resolver call for realized views, no target
  construction for platform documents.
- **Negative / accepted trade-off.** Two ways to place a view means a team must
  pick a convention; the guide's decision table is the tie-breaker. A
  redirecting chain leaves the app's default target empty (correct, but it
  surprises tests — documented).
- **Negative / accepted trade-off.** Cached DOM targets keep event listeners
  alive between renders, so eviction and app teardown must destroy them; the
  `onEvict` hook and `destroyViewTargeters` exist for that reason.
- **Latent bug fixed.** `DOMElementViewTarget.commit` now accepts string output
  and parses it as a fragment, so `StringTemplateView`s and other fragment
  producers render through the same target on the web (previously only DOM-node
  output worked).
- **Behavior-preserving.** `ResponseViewTargeter` always returns a target (its
  `commit()` no-ops without a response), so non-HTTP Node dispatches behave as
  before. Characterization tests (`node-dispatcher-render.spec.ts`) pin the four
  Node-only branches and ran green before and after the collapse.

## References

- Plan: `docs/plans/2026-11-13_VIEW_TARGETING_STRATEGY.md`
- Contracts: `packages/ndigo-view/src/view-targeter.ts`,
  `packages/ndigo-view/src/view-target.ts` (`likeViewTarget`)
- Pipeline: `packages/ndigo-dispatcher/src/dispatcher.ts`,
  `packages/ndigo-dispatcher/src/strategies/view-targeter-strategy.ts`
- Browser: `packages/ndigo-view-webcomponent/src/selector-view-targeter.ts`,
  `name-view-targeter.ts`, `route-view-targeter.ts`,
  `attribute-view-targeter.ts`, `engine.ts`
- Node: `packages/ndigo-platform-node/src/response-view-targeter.ts`,
  `node-dispatcher.ts`, `node-auto-configuration.ts`
- Presets: `packages/ndigo-platform-web/src/web-application.ts`
- Docs: guide [00 §3](../guides/00-core-concepts.md), guide
  [09 §7](../guides/09-views-and-content-negotiation.md) (basics — contract,
  precedence, defaults), guide
  [50](../guides/50-view-targeting.md) (the strategy in depth)
- Related: [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (resolver
  strategy; D-7 deferred here), [AD-89](2026-11-03_AD89_LAYER_BOUNDARIES.md)
  (layer boundaries), [AD-90](2026-11-05_AD90_APPLICATION_LIFECYCLE_PRESETS.md)
  (application presets)

## Revisit Trigger

Revisit when a consumer needs target-aware **engine** selection (AD-65 D-7:
views declaring which target kinds they support, `TargetingViewEngine`), a
non-HTTP Node transport that wants its own default chain, or request-derived
destinations. Request-derived selectors stay out of scope by policy: a selector
must come from static configuration, escaped with `CSS.escape` when the id is
dynamic. Until then the ordered targeter chain plus the `VIEW_TARGET` fallback
stands.
