# 2026-03-08 Architecture Roadmap

## Objective

Provide a strategic architecture roadmap for BlueJS that documents:

- platform portability design intent
- boot lifecycle trade-offs
- rendering engine flexibility
- domain/model boundary decisions
- service layer scope reevaluation
- package maturity and sequencing

## 1) Platform Portability Vision

BlueJS is designed around an **isomorphic core** with **platform-specific bindings**.

### Isomorphic Core

The core runtime model is intended to run in browser, Node.js, and hybrid environments:

- `@blue/factory`
- `@blue/context`
- `@blue/dispatcher`
- `@blue/domain`
- `@blue/service`
- `@blue/content`
- `@blue/validate`

These packages compose with foundational packages (`@blue/core`, `@blue/util`, `@blue/parser`, `@blue/model`) and should avoid hard-coding browser-only or Node-only APIs.

### Platform Bindings

Platform-specific behavior belongs in platform packages/adapters:

- `@blue/platform-web` (browser environment, cookies, browser argument resolvers)
- `@blue/view-webcomponent` (Custom Elements rendering adapter)
- `@blue/router` browser HashRouter implementation

Future direction:

- `@blue/platform-node` for Node/server bindings (server routing/environment, resource loading, cookie/session integration)

### Deployment Topologies

BlueJS should support multiple deployment models:

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

- `@blue/boot` contains `Application`, `ApplicationBuilder`, and `Site` scaffolding
- `Application.run()` initializes `GenericApplicationContext`
- `SiteBuilder` and full site orchestration remain incomplete

## 3) View Engine Flexibility

BlueJS keeps `@blue/view` as a renderer-agnostic contract layer:

- `View`
- `ViewResolver`
- resolver composition/caching abstractions

Concrete view engines are adapter packages:

- `@blue/view-webcomponent` (current)
- potential `@blue/view-react`
- potential `@blue/view-lit`

Dispatcher integration model remains engine-agnostic: it resolves a `View` and calls `view.render()`.

## 4) Domain/Model Reconciliation

`@blue/domain` carries forward a previous-generation MVVM-style component model.

Historical flow:

- controller action returns a domain component + view reference
- domain component functions as model/state holder
- view layer may use a view-model projection

Open architectural issue:

- reconcile boundaries between `@blue/domain` (component model) and `@blue/model` (runtime model validation)
- clarify domain/view boundary for different rendering paradigms (Web Components vs React-style component trees)

## 5) Service Layer Boundary

Previous framework iterations used thin HTTP and thick service abstractions.

Current BlueJS has a thicker HTTP layer (`@blue/http`) with interceptor chains and transform pipelines.

Open question:

- Should `@blue/service` retain legacy responsibilities (CSRF, offline, retry, caching),
- or should those concerns primarily live in HTTP/interceptor/platform layers?

This needs explicit boundary decisions before deepening service abstractions.

## 6) Package Maturity Snapshot (March 2026)

| Layer              | Package                   | Maturity             | Notes                                                                                                          |
| :----------------- | :------------------------ | :------------------- | :------------------------------------------------------------------------------------------------------------- |
| Integration        | `@blue/util`              | ✅ Mature            | Stable integration layer for utility dependencies                                                              |
| Integration        | `@blue/parser`            | ✅ Mature            | Stable parser combinator integration                                                                           |
| Integration        | `@blue/model`             | ✅ Mature            | Stable object model integration                                                                                |
| Foundation         | `@blue/core`              | ✅ Mature            | Strong primitives/transducer foundation                                                                        |
| Infrastructure     | `@blue/factory`           | 🟡 Advancing         | Scope implementations are integrated; lifecycle interfaces and processor orchestration are now in place        |
| Infrastructure     | `@blue/content`           | 🟡 ~45%              | Static content source and static theme resolver implementations are in place with test coverage                |
| Infrastructure     | `@blue/validate`          | 🟡 Advancing         | Validation redesign complete with registries, group-aware decorators, and backend adapters (`native` + `zod`)  |
| Context            | `@blue/context`           | 🟡 ~85%              | Content/theme integration is complete; refresh/close lifecycle and tree event propagation are implemented      |
| Web Infra          | `@blue/http`              | ✅ Mature            | Interceptor + transform pipeline in place                                                                      |
| Web Infra          | `@blue/router`            | 🟡 ~50%              | Route primitives/hash routing usable, transactions incomplete                                                  |
| Web Infra          | `@blue/telemetry`         | ✅ Recently built    | OTel alignment and severity mapping complete                                                                   |
| Request Processing | `@blue/dispatcher`        | 🟡 ~65%              | Core front-controller flow works; context-aware theme resolution strategy is integrated                        |
| Request Processing | `@blue/view`              | 🟡 ~40%              | Contracts/resolvers in place, rendering implementation light                                                   |
| Request Processing | `@blue/view-webcomponent` | 🟡 ~25%              | Decorators solid, runtime rendering/export surface incomplete                                                  |
| Application        | `@blue/service`           | 🟡 ~30%              | Core concepts present, implementation incomplete                                                               |
| Application        | `@blue/domain`            | 🔴 ~15%              | Minimal adoption and test coverage                                                                             |
| Application        | `@blue/platform-web`      | 🟡 ~45%              | Cookie theme resolver wiring is improved with context-aware setup helpers                                      |
| Application        | `@blue/print`             | ✅ Narrow scope      | Focused package, mostly complete                                                                               |
| Bootstrap          | `@blue/boot`              | 🟡 ~40%              | Browser theme bootstrap support and context refresh wiring are in place; full orchestration remains incomplete |
| Demo               | `blue-demo`               | 🟡 Working core flow | Dispatch integration works, feature completeness pending                                                       |

## 7) Open Architectural Questions

1. What is the canonical split of responsibilities between `@blue/http` and `@blue/service`?
2. How should `@blue/domain` and `@blue/model` be reconciled for modern UI engines?
3. What is the minimal viable `Site` model for multi-app/hybrid deployment?
4. Which browser-only pieces should move from general packages into `@blue/platform-web`?
5. What should `@blue/platform-node` include in its first MVP?
6. Should factory scoping remain integrated by default, or split into a base factory plus scoped extension once usage patterns stabilize?

## 8) Rough Sequencing

1. **Stabilize current runtime path**: dispatcher/view-webcomponent/platform-web integration in demo
2. **Clarify boundaries**: service-vs-http and domain-vs-model decisions
3. **Complete missing infrastructure**: lifecycle orchestration, router completion, and boot auto-configuration
4. **Add platform expansion**: begin `@blue/platform-node` exploration
5. **Then grow ecosystem**: auth/orm implementation on stable core boundaries
