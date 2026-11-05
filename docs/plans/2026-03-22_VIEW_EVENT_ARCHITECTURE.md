# 2026-03-22 View Event Architecture

**Date:** 2026-03-22  
**Status:** ✅ Completed  
**Priority:** High  
**Context:** ndigo view rendering pipeline and user interaction flow  
**Dependencies:** `@ndigo/view`, `@ndigo/view-webcomponent`, `@ndigo/router`, `@ndigo/dispatcher`, `@ndigo/context`, `apps/ndigo-demo`

---

## Executive Summary

This plan finalized ndigo's Spring MVC-inspired view architecture by hardening contracts for bidirectional flow:

1. **Controller → View:** Dispatcher renders model data into a ViewTarget through View + ViewEngine.
2. **View → Service:** ViewTarget bridges mapped UI CustomEvents to ApplicationContext events.
3. **Service → Controller/View:** Services trigger `router.refresh()` to re-dispatch current route and re-render updated state.

The implementation keeps dispatcher logic view-technology agnostic, pushes rendering details into View/ViewEngine, and keeps event bridging scoped to the rendering surface.

---

## Core Architectural Decisions

| Decision                             | Chosen Approach                               | Rationale                                                                    |
| ------------------------------------ | --------------------------------------------- | ---------------------------------------------------------------------------- |
| ViewEngine location                  | Internal to View                              | Mirrors Spring MVC (DispatcherServlet is view-tech agnostic).                |
| Event bridge host                    | ViewTarget                                    | Naturally scoped to rendered subtree and decoupled from components/services. |
| Event mapping                        | Declarative map (`domEvent` → `contextEvent`) | Explicit, auditable, and allows selective forwarding.                        |
| State refresh after service mutation | `router.refresh()`                            | Reuses full route dispatch pipeline; no duplicate render path.               |
| Telemetry/logging channel            | Interceptors + decorators                     | Not event-based; already implemented via `@ndigo/telemetry`.                 |
| Analytics channel                    | Explicit service calls                        | Preserves business semantics; avoids event overload.                         |

---

## Spring MVC Mapping

| Spring MVC                                  | ndigo                                   |
| ------------------------------------------- | --------------------------------------- |
| `DispatcherServlet`                         | `BrowserDispatcher`                     |
| `ViewResolver`                              | `ViewResolver` strategy chain           |
| `View.render(model, response)`              | `View.render(model, route, viewTarget)` |
| `HttpServletResponse` rendering surface     | `ViewTarget` rendering surface          |
| Template engine internal to View technology | `ViewEngine` resolved by View           |

---

## Interface Hierarchy

```text
@ndigo/view
  ViewTarget
    └── EventBridgeViewTarget

@ndigo/view-webcomponent
  DOMViewTarget extends EventBridgeViewTarget
    └── DOMElementViewTarget
```

### Notes

- `EventBridgeViewTarget` adds `setEventMap(eventMap)` to formalize mapped UI event forwarding.
- `DOMViewTarget` remains in `@ndigo/view-webcomponent` (not `@ndigo/view`) because it references DOM-specific types (`HTMLElement`).

---

## Implemented Changes

### Interface hardening

- Added `EventBridgeViewTarget` in `@ndigo/view`.
- Added `DOMViewTarget` and `likeDOMViewTarget` in `@ndigo/view-webcomponent`.
- Updated `WebComponentViewEngine` to use `likeDOMViewTarget(...)` instead of concrete `instanceof` checks.
- Added `refresh()` to `Router` interface and default implementation in `AbstractRouter`.
- Added `router.spec.ts` test coverage for `AbstractRouter.refresh()`.

### Lifecycle management

- Added `destroyed` + `destroy()` lifecycle behavior to `DOMElementViewTarget`.
- Added guard rails for destroyed targets in `prepare()` and `commit()`.
- Added listener cleanup lifecycle to demo `TodoService`:
    - Named listener references captured at `init()` time
    - `destroy()` unsubscribes all listeners via `context.off(...)`
    - Idempotent destroy behavior

### Bridge cleanup

- Removed legacy `@ndigo/view` `Bridge` stub (`bridge.ts`).
- Removed `export * from './bridge'` from `@ndigo/view` index.

### Demo cleanup

- Removed unnecessary type-cast around `viewTarget.setEventMap(...)` in demo context wiring.

---

## Validation

All quality gates passed after implementation:

- `pnpm build` ✅
- `pnpm test` ✅
- `pnpm lint` ✅

---

## Deferred Work

1. **Typed context keys** (`'router'`, `'viewTarget'`, `'webComponentViewEngine'`) with stronger compile-time contracts.
2. **Scale 2 architecture** for multi-context/site-level event boundaries.
3. **Cross-platform view-target abstractions** beyond DOM/web components.
4. **Route-level view lifecycle management** (destroy old view tree on navigation boundaries where required).
