# AD-53: Bidirectional view/event contract — explicit event-bridge, legacy Bridge removed

**Date:** 2026-03-22
**Status:** Accepted — implemented (plan marked Completed); view-resolution
strategy since extended by [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (2026-09-06).

## Context

BlueJS's Spring MVC-inspired view pipeline had only half the contract
formalized (Controller → View rendering). The reverse flows — View → Service
(mapped UI events to context events) and Service → Controller/View
(services trigger re-render after mutation) — were informal, and `@blue/view`
still shipped a legacy `Bridge` stub. This ADR hardened the bidirectional
contract: dispatcher stays view-technology agnostic, rendering detail lives
in View/ViewEngine, and event bridging is scoped to the rendering surface.

## Evidence

- Plan: `docs/plans/2026-03-22_VIEW_EVENT_ARCHITECTURE.md` — interface
  hierarchy, implemented changes, Spring MVC mapping, deferred work.
- `EventBridgeViewTarget extends ViewTarget` lives in
  `packages/blue-view/src/view-target.ts:45`, exported via
  `packages/blue-view/src/index.ts` (`export * from './view-target'`) and
  `./view-resolver`, `./island-view-resolver`,
  `./content-negotiation-view-resolver`, `./view-mapping`, `./producer-view`,
  `./json-view`, `./text-view`, `./csv-view`, `./octet-stream-view`.
- `DOMViewTarget extends EventBridgeViewTarget`, `likeDOMViewTarget`, and
  `DOMElementViewTarget` are in
  `packages/blue-view-webcomponent/src/engine.ts:25-57`; `WebComponentViewEngine`
  uses `likeDOMViewTarget(...)` (line 38) instead of concrete `instanceof`.
- Legacy removed: `packages/blue-view/src/bridge.ts` does not exist and
  `index.ts` has no `./bridge` export (verified current tree).
- View-resolution strategies today include `view-resolver.ts`,
  `island-view-resolver.ts`, `content-negotiation-view-resolver.ts`
  (`@blue/view`) and `web-component-view-resolver.ts` (`@blue/view-webcomponent`).
- `Router.refresh()` re-dispatch: `AbstractRouter.refresh` with
  `router.spec.ts` coverage (per plan §Implemented changes).

## Decision

- **D-1 — ViewEngine resolved by and internal to View:** dispatcher stays
  view-agnostic; rendering is pushed into View/ViewEngine (mirrors
  DispatcherServlet vs ViewResolver).
- **D-2 — event bridge host is the ViewTarget:** `EventBridgeViewTarget`
  adds `setEventMap(eventMap)` for a declarative `domEvent → contextEvent`
  map — explicit, auditable, selective forwarding, decoupled from
  components/services. `DOMViewTarget` stays in `@blue/view-webcomponent`
  because it references DOM types.
- **D-3 — state refresh after service mutation:** services call
  `router.refresh()` to re-dispatch the current route and re-render —
  reuses the full route-dispatch pipeline, no duplicate render path.
- **D-4 — telemetry/logging and analytics are not event-based:** the former
  stays on interceptors/decorators via `@blue/telemetry`; the latter are
  explicit service calls to preserve business semantics.
- **D-5 — legacy removal:** the `Bridge` stub (`bridge.ts`) and its
  `export * from './bridge'` are deleted; event bridging is owned by
  `EventBridgeViewTarget`.
- **Deferred (recorded in plan):** typed context keys
  (`'router'`/`'viewTarget'`/`'webComponentViewEngine'`), Scale-2
  multi-context boundaries (taken up by AD-54/AD-65), cross-platform
  view-target abstractions, route-level view lifecycle teardown.

## Consequences

- `@blue/view` owns the view contracts (`ViewTarget`, `ViewResolver`
  strategies, serializing views); `@blue/view-webcomponent` owns DOM-specific
  surfaces and engines.
- `DOMElementViewTarget` gained `destroyed`/`destroy()` lifecycle with
  guard rails in `prepare()`/`commit()`; demo `TodoService` destroys
  listeners idempotently via `context.off(...)`.
- Legacy `Bridge` is gone; any remaining event forwarding is explicit and
  declarative through the bridge map.
- Host-orchestration of these shells is the subject of
  [AD-18](2026-09-13_AD18_HOST_RUNTIME.md); view-resolution strategy is
  extended by [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (2026-09-06).

## References

- Plan: `docs/plans/2026-03-22_VIEW_EVENT_ARCHITECTURE.md`
- Implementation: `packages/blue-view/src/view-target.ts` (line 45),
  `packages/blue-view/src/index.ts`;
  `packages/blue-view-webcomponent/src/engine.ts` (lines 25-57);
  `packages/blue-view/src/{view-resolver,island-view-resolver,content-negotiation-view-resolver}.ts`;
  `packages/blue-view-webcomponent/src/web-component-view-resolver.ts`
- Related: [AD-18](2026-09-13_AD18_HOST_RUNTIME.md), [AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md) (2026-09-06,
  view-resolution strategy)

## Revisit Trigger

Revisit if a view surface needs another cross-platform target abstraction
(non-DOM) or typed context-key contracts, both deferred in the plan; the
Scale-2 event boundaries were subsequently handled by AD-54/[AD-65](2026-09-06_AD65_VIEW_RESOLUTION_STRATEGY.md).
