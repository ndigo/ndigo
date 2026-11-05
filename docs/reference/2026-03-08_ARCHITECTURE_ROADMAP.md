# 2026-03-08 Architecture Roadmap

> **⚠️ ARCHIVED** — superseded by the living [ARCHITECTURE.md](../../ARCHITECTURE.md)
> (kept current) and the decision record series
> [docs/decisions/README.md](../decisions/README.md). The package-maturity
> and sequencing content shipped via the 2026-05-27 feature-completeness
> roadmap (AD-01..AD-06). Kept for history.

## Objective

Provide a strategic architecture roadmap for ndigo that documents:

- platform portability design intent
- boot lifecycle trade-offs
- rendering engine flexibility
- domain/model boundary decisions
- service layer scope reevaluation
- package maturity and sequencing

## 1) Platform Portability Vision

ndigo is designed around an **isomorphic core** with **platform-specific bindings**.

### Isomorphic Core

The core runtime model is intended to run in browser, Node.js, and hybrid environments:

- `@ndigo/factory`
- `@ndigo/context`
- `@ndigo/dispatcher`
- `@ndigo/domain`
- `@ndigo/service`
- `@ndigo/content`
- `@ndigo/validate`

These packages compose with foundational packages (`@ndigo/core`, `@ndigo/util`, `@ndigo/parser`, `@ndigo/model`) and should avoid hard-coding browser-only or Node-only APIs.

### Platform Bindings

Platform-specific behavior belongs in platform packages/adapters:

- `@ndigo/platform-web` (browser environment, cookies, browser argument resolvers)
- `@ndigo/view-webcomponent` (Custom Elements rendering adapter)
- `@ndigo/router` browser HashRouter implementation

Future direction:

- `@ndigo/platform-node` for Node/server bindings (server routing/environment, resource loading, cookie/session integration)

### Deployment Topologies

ndigo should support multiple deployment models:

1. **Full-browser**: Dispatch + service + view entirely in browser
2. **Hybrid split**: View in browser; dispatch/service in Node.js
3. **Configurable split point**: Boundary can move depending on runtime constraints (latency, SEO, security)

## 2) Boot Lifecycle Design

### Previous Generation: Site + Page Dual Boot

Prior framework generation used dual boot concepts:

- **Site** booted application-level runtime concerns
- **Page** booted view/runtime rendering concerns

Boot-order trade-off:

- **Page-first**: Fast first paint, slower interactivity readiness
- **Site-first**: Slower first paint (white screen), faster interactivity once rendered

Multi-application orchestration was envisioned through `Site`, but in practice one main app accumulated most complexity.

### Current State

- `@ndigo/boot` contains `Application`, `ApplicationBuilder`, and `Site` scaffolding
- `Application.run()` initializes `GenericApplicationContext`
- `SiteBuilder` and full site orchestration remain incomplete (retired).

## 3) View Engine Flexibility

ndigo keeps `@ndigo/view` as a renderer-agnostic contract layer:

- `View`
- `ViewResolver`
- resolver composition/caching abstractions

Concrete view engines are adapter packages:

- `@ndigo/view-webcomponent` (current)
- potential `@ndigo/view-react`
- potential `@ndigo/view-lit`

Dispatcher integration model remains engine-agnostic: it resolves a `View` and calls `view.render()`
(updated: producer views return a `RenderResult` document the dispatcher writes — `renderTo` +
`writeRenderResult`; fragment views still render into a `ViewTarget`).

## 4) Domain/Model Reconciliation

`@ndigo/domain` carries forward a previous-generation MVVM-style component model.

Historical flow:

- controller action returns a domain component + view reference
- domain component functions as model/state holder
- view layer may use a view-model projection

Open architectural issue:

- reconcile boundaries between `@ndigo/domain` (component model) and `@ndigo/model` (runtime model validation)
- clarify domain/view boundary for different rendering paradigms (Web Components vs React-style component trees)

## 5) Service Layer Boundary

Previous framework iterations used thin HTTP and thick service abstractions.

Current ndigo has a thicker HTTP layer (`@ndigo/http`) with interceptor chains and transform pipelines.

Open question:

- Should `@ndigo/service` retain legacy responsibilities (CSRF, offline, retry, caching),
- or should those concerns primarily live in HTTP/interceptor/platform layers?

This needs explicit boundary decisions before deepening service abstractions.

## 6) Package Maturity Snapshot (March 2026)

| Layer              | Package                    | Maturity             | Notes                                                                                                          |
| :----------------- | :------------------------- | :------------------- | :------------------------------------------------------------------------------------------------------------- |
| Integration        | `@ndigo/util`              | ✅ Mature            | Stable integration layer for utility dependencies                                                              |
| Integration        | `@ndigo/parser`            | ✅ Mature            | Stable parser combinator integration                                                                           |
| Integration        | `@ndigo/model`             | ✅ Mature            | Stable object model integration                                                                                |
| Foundation         | `@ndigo/core`              | ✅ Mature            | Strong primitives/transducer foundation                                                                        |
| Infrastructure     | `@ndigo/factory`           | 🟡 Advancing         | Scope implementations are integrated; lifecycle interfaces and processor orchestration are now in place        |
| Infrastructure     | `@ndigo/content`           | 🟡 ~45%              | Static content source and static theme resolver implementations are in place with test coverage                |
| Infrastructure     | `@ndigo/validate`          | 🟡 Advancing         | Validation redesign complete with registries, group-aware decorators, and backend adapters (`native` + `zod`)  |
| Context            | `@ndigo/context`           | 🟡 ~85%              | Content/theme integration is complete; refresh/close lifecycle and tree event propagation are implemented      |
| Web Infra          | `@ndigo/http`              | ✅ Mature            | Interceptor + transform pipeline in place                                                                      |
| Web Infra          | `@ndigo/router`            | 🟡 ~50%              | Route primitives/hash routing usable, transactions incomplete                                                  |
| Web Infra          | `@ndigo/telemetry`         | ✅ Recently built    | OTel alignment and severity mapping complete                                                                   |
| Request Processing | `@ndigo/dispatcher`        | 🟡 ~65%              | Core front-controller flow works; context-aware theme resolution strategy is integrated                        |
| Request Processing | `@ndigo/view`              | 🟡 ~40%              | Contracts/resolvers in place, rendering implementation light                                                   |
| Request Processing | `@ndigo/view-webcomponent` | 🟡 ~25%              | Decorators solid, runtime rendering/export surface incomplete                                                  |
| Application        | `@ndigo/service`           | 🟡 ~30%              | Core concepts present, implementation incomplete                                                               |
| Application        | `@ndigo/domain`            | 🔴 ~15%              | Minimal adoption and test coverage                                                                             |
| Application        | `@ndigo/platform-web`      | 🟡 ~45%              | Cookie theme resolver wiring is improved with context-aware setup helpers                                      |
| Application        | `@ndigo/print`             | ✅ Narrow scope      | Focused package, mostly complete                                                                               |
| Bootstrap          | `@ndigo/boot`              | 🟡 ~40%              | Browser theme bootstrap support and context refresh wiring are in place; full orchestration remains incomplete |
| Demo               | `ndigo-demo`               | 🟡 Working core flow | Dispatch integration works, feature completeness pending                                                       |

## 7) Open Architectural Questions

1. What is the canonical split of responsibilities between `@ndigo/http` and `@ndigo/service`?
2. How should `@ndigo/domain` and `@ndigo/model` be reconciled for modern UI engines?
3. What is the minimal viable `Site` model for multi-app/hybrid deployment?
4. Which browser-only pieces should move from general packages into `@ndigo/platform-web`?
5. What should `@ndigo/platform-node` include in its first MVP?
6. Should factory scoping remain integrated by default, or split into a base factory plus scoped extension once usage patterns stabilize?

## 8) Rough Sequencing

1. **Stabilize current runtime path**: dispatcher/view-webcomponent/platform-web integration in demo
2. **Clarify boundaries**: service-vs-http and domain-vs-model decisions
3. **Complete missing infrastructure**: lifecycle orchestration, router completion, and boot auto-configuration
4. **Add platform expansion**: begin `@ndigo/platform-node` exploration
5. **Then grow ecosystem**: auth/orm implementation on stable core boundaries
