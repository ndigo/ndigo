# Ndigo Package Platform Separation — Isomorphic / Web / Node

**Date:** 2026-09-04
**Status:** Plan (pending confirmation)
**Goal:** Properly separate concerns so isomorphic packages are platform-free, and all browser/node-conditional code lives in `@ndigo/platform-web` / `@ndigo/platform-node` (or dedicated web/node split packages like OTel does: `@opentelemetry/api` → `sdk-trace-web`/`sdk-trace-node`).

---

## 1. The guiding principle

| Tier                                                                                                                                                                                                                           | Constraint                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Isomorphic** (`@ndigo/core`, `-util`, `-model`, `-router`, `-dispatcher`, `-context`, `-factory`, `-view`, `-view-webcomponent`, `-http`, `-signals`, `-validate`, `-domain`, `-service`, `-orm`, `-content`, `-management`) | **No** `node:` imports, **no** DOM globals (`document`/`window`/`HTMLElement`). Dependency edges only to other isomorphic packages. |
| **Web** (`@ndigo/platform-web` + web-only packages)                                                                                                                                                                            | May depend on isomorphic; **no** `node:` imports.                                                                                   |
| **Node** (`@ndigo/platform-node` + node-only packages)                                                                                                                                                                         | May depend on isomorphic; `node:` allowed; **no** DOM globals.                                                                      |

A package is classified by what it imports, not by its name. A class that is DOM-free must not force a DOM dependency onto its importers.

---

## 2. Catalog of concrete shortcuts (verified)

### 2.1 `@ndigo/telemetry` — one package serving all three tiers (THE flagship case)

OTel models the right shape: `api` (isomorphic), `sdk-trace-web`, `sdk-trace-node`. Ndigo's telemetry has:

| Concern                                                                         | Current home                                        | Should be                                                |
| ------------------------------------------------------------------------------- | --------------------------------------------------- | -------------------------------------------------------- |
| `FeatureMetricAggregator`, `@counted`, loggers, severity, `CounterRateResolver` | `@ndigo/telemetry`                                  | **isomorphic** `@ndigo/telemetry` (no platform deps)     |
| `configureTelemetry` + `NodeSDK` + OTLP exporters + `node-config`               | `@ndigo/telemetry`                                  | **node** `@ndigo/telemetry-node` (or platform-node slot) |
| `browser-config.ts`                                                             | `@ndigo/telemetry`                                  | **web** `@ndigo/telemetry-web` (or platform-web slot)    |
| `instrumentation/http-server`, `http-response-view-target`                      | `@ndigo/telemetry` → imports `@ndigo/platform-node` | **node** slot                                            |
| `instrumentation/router` → imports `@ndigo/platform-web`                        | `@ndigo/telemetry`                                  | **web** slot                                             |

**Breaks:** `@ndigo/telemetry`'s index currently pulls both platform packages (dep graph: `telemetry → platform-node + platform-web`), so anything importing telemetry transitively drags both. This is the OTel-style split: fresh `@ndigo/telemetry-node` / `@ndigo/telemetry-web` packages (or slots) hold the SDK-config + platform instrumentations; `@ndigo/telemetry` keeps only isomorphic API/aggregator/logger.

### 2.2 `@ndigo/boot` — browser-coupled but consumed by node apps

- `index.ts` re-exports `web-auto-configuration` → `@ndigo/view-webcomponent` → `AbstractWebComponent` (extends `HTMLElement`).
- **Consequence:** node apps that import `ApplicationBuilder` from `@ndigo/boot` drag DOM (recorded in `@ndigo/test`'s bootApp workaround: "uses `MetadataConfigApplicationContext` directly … keeps `@ndigo/test` free of DOM-coupled imports").
- **Fix:** move `WebAutoConfiguration` + `DOMElementViewTarget`-sourcing into `@ndigo/platform-web`; `@ndigo/boot` keeps only isomorphic `Application`/`ApplicationBuilder`/`ConfigurationProperties`. (The §6.2 node-auto-register revisit from `NODE_PLATFORM_FOUNDATION.md` becomes possible once boot is node-free.)

### 2.3 `@ndigo/dispatcher.BrowserDispatcher` — a browser-named class in an isomorphic package

- `dispatch()` is **DOM-free** (resolves `viewTarget` from context — verified no DOM refs).
- **Fix:** extract an isomorphic `AbstractDispatcher` (or `RouteDispatcher`) base holding `dispatch`/`_processDispatchResult`/`_applyDefaultViewName`; `BrowserDispatcher extends` it in `@ndigo/platform-web`; `NodeDispatcher extends` the base in `@ndigo/platform-node` (currently `extends BrowserDispatcher` — a shortcut).
- This was flagged as a TODO in the original SSR plan (§2.1) and unblocks removing `telemetry → dispatcher`'s browser coupling.

### 2.4 `@ndigo/test` — bootApp workaround + node-pure-by-construction

- Documents the boot coupling (§2.2). Once boot is split, `bootApp` can use `ApplicationBuilder` again (or stay node-pure — either is fine).
- `@ndigo/test` is node-only by design (MockMVC, node dispatch) — classification is correct, just unblocked by 2.2.

### 2.5 Platform-package hygiene

- `ndigo-platform-web`/`ndigo-platform-node` currently hold argument resolvers etc. — largely correct; verify no cross-imports (`platform-web` importing `node:`, `platform-node` importing DOM — checked: neither has direct violations).
- `view-webcomponent` index pulls `AbstractWebComponent` (DOM) — the islands work added `hydrate` there, which is web-correct; `IslandView`/`serializeModel` correctly went to `@ndigo/view` (isomorphic). Good precedent.

---

## 3. Proposed execution phases

### Phase 1 — Isomorphic extraction (interfaces/base classes)

1. **telemetry:** split `@ndigo/telemetry` → share nothing but isomorphic (aggregator, `@counted`, logger, severity). New `@ndigo/telemetry-node` (NodeSDK config, OTLP, http-server/http-response-view-target instrumentations) + `@ndigo/telemetry-web` (browser config, router instrumentation). Keep `@ndigo/telemetry` as the isomorphic core; re-export shims optional (clean cutover preferred).
2. **dispatcher:** extract `AbstractDispatcher` (DOM-free dispatch core); `BrowserDispatcher` → `@ndigo/platform-web`, `NodeDispatcher` → `@ndigo/platform-node`, both extend the base.

### Phase 2 — Boot + platform moves

3. **boot:** move `WebAutoConfiguration`/DOM-dependent entries to `@ndigo/platform-web`; boot becomes node-safe. Revisit the node auto-registration.
4. **management:** confirm it stays node-only (it's actuator-serving node apps — correct).

### Phase 3 — Dedicated split packages (if needed)

5. Assess whether `@ndigo/dom` (Linkedom/Browser providers), `@ndigo/service`, `@ndigo/auth-*` need isomorphic/platsplits; document or defer.

---

## 4. Risk & verification per phase

- Every move: `pnpm build` (28 projects) + targeted package tests + full `pnpm test` + lint.
- Track breakage via the nx dep graph (any isomorphic package gaining a platform dep = failure).
- Keep `packages/ndigo-telemetry` name for the isomorphic core (renaming package dirs is churn; new sibling packages are additive), OR rename if you prefer explicit mapping — user's call.

---

## 5. Open questions for you

1. **Telemetry split shape:** `@ndigo/telemetry` (isomorphic core) + `@ndigo/telemetry-node` + `@ndigo/telemetry-web`, vs. keeping one package with subpath exports (`@ndigo/telemetry/node`, `@ndigo/telemetry/web`)? OTel uses separate packages; subpath exports are less churn. I lean **subpath exports** within `@ndigo/telemetry` (simpler, still enforces the boundary via `exports`), unless you want literal sibling packages.
2. **`@ndigo/boot`:** split WebAutoConfiguration into `@ndigo/platform-web` and keep boot node-free — confirm.
3. **Scope:** do all three phases now, or start with telemetry (the explicit example) + dispatcher base, then boot?
