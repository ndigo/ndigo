# Blue Package Platform Separation — Isomorphic / Web / Node

**Date:** 2026-09-04
**Status:** Plan (pending confirmation)
**Goal:** Properly separate concerns so isomorphic packages are platform-free, and all browser/node-conditional code lives in `@blue/platform-web` / `@blue/platform-node` (or dedicated web/node split packages like OTel does: `@opentelemetry/api` → `sdk-trace-web`/`sdk-trace-node`).

---

## 1. The guiding principle

| Tier | Constraint |
|---|---|
| **Isomorphic** (`@blue/core`, `-util`, `-model`, `-router`, `-dispatcher`, `-context`, `-factory`, `-view`, `-view-webcomponent`, `-http`, `-signals`, `-validate`, `-domain`, `-service`, `-orm`, `-content`, `-management`) | **No** `node:` imports, **no** DOM globals (`document`/`window`/`HTMLElement`). Dependency edges only to other isomorphic packages. |
| **Web** (`@blue/platform-web` + web-only packages) | May depend on isomorphic; **no** `node:` imports. |
| **Node** (`@blue/platform-node` + node-only packages) | May depend on isomorphic; `node:` allowed; **no** DOM globals. |

A package is classified by what it imports, not by its name. A class that is DOM-free must not force a DOM dependency onto its importers.

---

## 2. Catalog of concrete shortcuts (verified)

### 2.1 `@blue/telemetry` — one package serving all three tiers (THE flagship case)

OTel models the right shape: `api` (isomorphic), `sdk-trace-web`, `sdk-trace-node`. Blue's telemetry has:

| Concern | Current home | Should be |
|---|---|---|
| `FeatureMetricAggregator`, `@counted`, loggers, severity, `CounterRateResolver` | `@blue/telemetry` | **isomorphic** `@blue/telemetry` (no platform deps) |
| `configureTelemetry` + `NodeSDK` + OTLP exporters + `node-config` | `@blue/telemetry` | **node** `@blue/telemetry-node` (or platform-node slot) |
| `browser-config.ts` | `@blue/telemetry` | **web** `@blue/telemetry-web` (or platform-web slot) |
| `instrumentation/http-server`, `http-response-view-target` | `@blue/telemetry` → imports `@blue/platform-node` | **node** slot |
| `instrumentation/router` → imports `@blue/platform-web` | `@blue/telemetry` | **web** slot |

**Breaks:** `@blue/telemetry`'s index currently pulls both platform packages (dep graph: `telemetry → platform-node + platform-web`), so anything importing telemetry transitively drags both. This is the OTel-style split: fresh `@blue/telemetry-node` / `@blue/telemetry-web` packages (or slots) hold the SDK-config + platform instrumentations; `@blue/telemetry` keeps only isomorphic API/aggregator/logger.

### 2.2 `@blue/boot` — browser-coupled but consumed by node apps

- `index.ts` re-exports `web-auto-configuration` → `@blue/view-webcomponent` → `AbstractWebComponent` (extends `HTMLElement`).
- **Consequence:** node apps that import `ApplicationBuilder` from `@blue/boot` drag DOM (recorded in `@blue/test`'s bootApp workaround: "uses `MetadataConfigApplicationContext` directly … keeps `@blue/test` free of DOM-coupled imports").
- **Fix:** move `WebAutoConfiguration` + `DOMElementViewTarget`-sourcing into `@blue/platform-web`; `@blue/boot` keeps only isomorphic `Application`/`ApplicationBuilder`/`ConfigurationProperties`. (The §6.2 node-auto-register revisit from `NODE_PLATFORM_FOUNDATION.md` becomes possible once boot is node-free.)

### 2.3 `@blue/dispatcher.BrowserDispatcher` — a browser-named class in an isomorphic package

- `dispatch()` is **DOM-free** (resolves `viewTarget` from context — verified no DOM refs).
- **Fix:** extract an isomorphic `AbstractDispatcher` (or `RouteDispatcher`) base holding `dispatch`/`_processDispatchResult`/`_applyDefaultViewName`; `BrowserDispatcher extends` it in `@blue/platform-web`; `NodeDispatcher extends` the base in `@blue/platform-node` (currently `extends BrowserDispatcher` — a shortcut).
- This was flagged as a TODO in the original SSR plan (§2.1) and unblocks removing `telemetry → dispatcher`'s browser coupling.

### 2.4 `@blue/test` — bootApp workaround + node-pure-by-construction

- Documents the boot coupling (§2.2). Once boot is split, `bootApp` can use `ApplicationBuilder` again (or stay node-pure — either is fine).
- `@blue/test` is node-only by design (MockMVC, node dispatch) — classification is correct, just unblocked by 2.2.

### 2.5 Platform-package hygiene

- `blue-platform-web`/`blue-platform-node` currently hold argument resolvers etc. — largely correct; verify no cross-imports (`platform-web` importing `node:`, `platform-node` importing DOM — checked: neither has direct violations).
- `view-webcomponent` index pulls `AbstractWebComponent` (DOM) — the islands work added `hydrate` there, which is web-correct; `IslandView`/`serializeModel` correctly went to `@blue/view` (isomorphic). Good precedent.

---

## 3. Proposed execution phases

### Phase 1 — Isomorphic extraction (interfaces/base classes)
1. **telemetry:** split `@blue/telemetry` → share nothing but isomorphic (aggregator, `@counted`, logger, severity). New `@blue/telemetry-node` (NodeSDK config, OTLP, http-server/http-response-view-target instrumentations) + `@blue/telemetry-web` (browser config, router instrumentation). Keep `@blue/telemetry` as the isomorphic core; re-export shims optional (clean cutover preferred).
2. **dispatcher:** extract `AbstractDispatcher` (DOM-free dispatch core); `BrowserDispatcher` → `@blue/platform-web`, `NodeDispatcher` → `@blue/platform-node`, both extend the base.

### Phase 2 — Boot + platform moves
3. **boot:** move `WebAutoConfiguration`/DOM-dependent entries to `@blue/platform-web`; boot becomes node-safe. Revisit the node auto-registration.
4. **management:** confirm it stays node-only (it's actuator-serving node apps — correct).

### Phase 3 — Dedicated split packages (if needed)
5. Assess whether `@blue/dom` (Linkedom/Browser providers), `@blue/service`, `@blue/auth-*` need isomorphic/platsplits; document or defer.

---

## 4. Risk & verification per phase
- Every move: `pnpm build` (28 projects) + targeted package tests + full `pnpm test` + lint.
- Track breakage via the nx dep graph (any isomorphic package gaining a platform dep = failure).
- Keep `packages/blue-telemetry` name for the isomorphic core (renaming package dirs is churn; new sibling packages are additive), OR rename if you prefer explicit mapping — user's call.

---

## 5. Open questions for you
1. **Telemetry split shape:** `@blue/telemetry` (isomorphic core) + `@blue/telemetry-node` + `@blue/telemetry-web`, vs. keeping one package with subpath exports (`@blue/telemetry/node`, `@blue/telemetry/web`)? OTel uses separate packages; subpath exports are less churn. I lean **subpath exports** within `@blue/telemetry` (simpler, still enforces the boundary via `exports`), unless you want literal sibling packages.
2. **`@blue/boot`:** split WebAutoConfiguration into `@blue/platform-web` and keep boot node-free — confirm.
3. **Scope:** do all three phases now, or start with telemetry (the explicit example) + dispatcher base, then boot?