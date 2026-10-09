# Code Review and Mitigation — 2026-10-07 (delta sweep at `76d28575`)

**Date:** 2026-10-07
**Scope:** Whole repository at `76d28575` (master, clean tree) — 40 packages, 7 apps,
`docs/`, root tooling and CI — with the review focused on the delta since the last review
baseline `96337f24`: `fbb5233e` (wave-5 remediation), `0c4becbd` (wave-4 mop-up),
`60d601ca` (valid app client bundles, todo seeding, Vite lower-decorators plugin),
`4ee4a41f` (AD-69 DSD first-paint + `AsFormAssociated`), `f6cdf832` (AD-70 `@blue/inspect`

- config JSON Schema + two oxlint rules), `76d28575` (AD-71 Web Awesome reference
  integration).
  **Relation to prior sweeps:** the two 2026-10-06 reviews cover everything up to
  `96337f24`. Nothing below re-reports their findings unless the fix is incomplete or the
  item is still open at HEAD (marked `[still-open]` / `[fix-incomplete]`).
  **Method:** 11 parallel review slices (inspectoxlint, boot schema, dispatcher/views,
  webcomponent/island, docs, test lanes, security, architecture/reuse, apps/CI, residuals,
  industry gaps), each with shell-level probes; the integrator then independently
  re-verified the headline claims: the full gate set at HEAD, the `blue-hello` bundle
  syntax, the `blue-todo` dev transform, the schema/guide `{cipher:…}` object form against
  the string-only resolver, the live AD-71 island flow in headless Chromium (DSD first paint
  → in-place hydration → FACE submit → SSE), the out-of-repo benchmark import under a
  simulated CI layout, and the Web Awesome `data:` icon fetch against the default CSP.
  **Status:** Findings recorded; **waves 1–5 executed** (Wave 6 is ADR-gated by design) — see
  §10 for the execution log and the deferred items. Working tree clean before and after; every
  probe lived under `/tmp` and was deleted.

**Findings IDs:** `<area>-<n>` where area ∈ {BLK build/CI, INS inspect, BOOT boot/config,
OXL lint rules, VIEW dispatcher/views, WC web-component/island, APP apps, TST test lanes,
REU reuse/architecture, DOC docs, GAP industry gaps, RES residuals}.

---

## 0. Gate baseline (run at `76d28575`, clean tree)

| Gate                   | Result | Evidence                                                                              |
| :--------------------- | :----- | :------------------------------------------------------------------------------------ |
| `pnpm build`           | ✅     | 40 projects, 40/40 local cache hits (nx), exit 0                                      |
| `pnpm test`            | ✅     | 47 projects green, 0 cache hits, 1 m 10 s                                             |
| `pnpm lint`            | ✅     | `oxlint --type-aware --deny-warnings`, zero diagnostics                               |
| `pnpm format:check`    | ✅     | 1640 files formatted                                                                  |
| `pnpm docs:links`      | ✅     | 280 files / 1050 relative links                                                       |
| `pnpm audit --prod`    | ✅     | No known vulnerabilities                                                              |
| `pnpm manifest:check`  | ✅     | All packages + root conform                                                           |
| `pnpm agents:check`    | ✅     | 63 generated + 3 repo-owned files match manifests                                     |
| `pnpm typecheck`       | ✅     | `tsc -b tsconfig.build.json` (build config only — see TST-4)                          |
| `pnpm doc` + freshness | ✅     | Regeneration byte-identical; `git diff` empty                                         |
| Focused new suites     | ✅     | `@blue/inspect` 7, `@blue/boot` schema 6, oxlint rules 34, webcomponent 15, island 27 |

Process note: the green board hides the defects below because (a) no CI or nx lane builds
the `blue-hello` / `blue-views` / `blue-host` bundles, (b) only `blue-island` has a bundle
syntax check, (c) the `blue-island` FACE path is jsdom-shimmed and only verified manually,
and (d) the `blue-view-webcomponent` benchmark spec resolves through a sibling checkout
that exists only on the development machine (§1).

---

## 1. Block findings (1)

### BLK-1 `[exec]` The `@blue/view-webcomponent` test lane cannot run on a fresh checkout — it imports a sibling repository

- **Where:** `packages/blue-view-webcomponent/test/benchmark.spec.ts:7-8` —
  `import { BenchmarkHarness } from '../../../../todomvc/examples/bluejs/src/benchmark'`
  (and `TodoStateService` from the same tree).
- **Evidence:** the file is tracked (`git ls-files`), collected by the root vitest config
  (`pnpm exec vitest list --filesOnly` lists it), and the package's test script is
  `vitest run` (root config). The relative path escapes the repository by four levels: on
  this machine it resolves to `/home/jeff/Workspace/todomvc/...` (present — the lane is
  green locally); under a CI layout it resolves to a non-existent sibling
  (`[...]/test/../../../../todomvc/...` → `exists: false`, probe run 2026-10-07). CI runs
  `pnpm test` on a fresh runner (`.github/workflows/ci.yml`), where the import fails at
  collection and the project fails.
- **Impact:** the `quality` CI job is red on any real runner (and the lane is
  irreproducible for contributors without that sibling checkout). It is the only
  repository test that reaches outside the repo.
- **Fix:** delete the spec (the benchmark it runs belongs to the `todomvc` example repo,
  not to the framework) or port the harness/state fixture into
  `packages/blue-view-webcomponent/test/fixtures/`. Add a gate that fails on relative
  imports escaping the repository root (extend `scripts/check-manifests.mjs`).
- **Regression test:** `pnpm exec vitest list --filesOnly` + a manifest-check assertion
  that no tracked import specifier resolves outside the repo root.

---

## 2. High findings (6)

### HI-1 `[exec]` Apps ship raw TC39 decorators: `blue-hello`/`blue-views` production bundles are invalid JavaScript, and `blue-todo`/`blue-views` dev servers serve them

- **Where:** `apps/blue-hello/vite.config.ts:16-27`, `apps/blue-views/vite.config.ts:16-27`
  (the `oxc.tsconfigRaw.experimentalDecorators:false` workaround — which does not lower
  anything, per the plugin's own header), `apps/blue-todo/vite.config.ts:9` (plugin gated
  `command === 'build'`); artifacts `apps/blue-hello/dist/assets/index-ThBFIxuX.js:19811`,
  `apps/blue-views/dist/assets/index-DF3UiGr9.js:30143`.
- **Evidence:** `[exec]` built `blue-hello` at HEAD → bundle contains
  `var HelloController = @routeMapping("/") class {` and `node --check` fails with
  `SyntaxError: Invalid or unexpected token`; `blue-views` identical. `[exec]`
  `pnpm --filter @blue/todo dev` on port 3000 → `GET /src/index-controller.ts` returns
  `@routeMapping("/") class IndexController …` verbatim (5 decorator occurrences), so the
  documented dev workflow (`apps/blue-todo/README.md`, `apps/README.md:44`) loads a
  `SyntaxError` in the browser. `60d601ca` fixed only `blue-island` + `blue-todo`
  build paths; Vitest masks it because its pipeline lowers decorators via esbuild.
- **Impact:** two demo apps cannot run in a browser at all from their built output; the
  `blue-todo` dev loop is broken. No gate notices (neither app is built in CI).
- **Fix:** apply the shared `lowerDecorators()` plugin in both `vite.config.ts` files
  unconditionally and delete the dead `oxc.tsconfigRaw` block; drop the `command === 'build'`
  gate in `blue-todo` (or align all app configs on one documented policy). Generalize the
  `client-bundle` guard to every app and add a CI step that parses each `apps/*/dist/**/*.js`.
- **Regression test:** per-app bundle-parse spec (extend
  `apps/blue-island/test/client-bundle.spec.ts`) + a dev-transform assertion
  (`GET /src/index-controller.ts` contains no `@decorator` token).

### HI-2 `[exec]` `hydrateIslands` aborts every remaining island when one component's `.model` setter throws

- **Where:** `packages/blue-view-webcomponent/src/hydrate.ts:45` (unguarded `forEach` body),
  `:58-83` (both the DSD branch and the legacy branch).
- **Evidence:** `[exec]` jsdom probe with a throwing `bad-island` followed by `good-island`:
  `hydrateIslands()` rethrows and `good-island` never hydrates (setter calls 0). The
  failing element's own DSD fallback survives.
- **Impact:** one misbehaving island kills hydration for the whole page — the exact failure
  the DSD fallback exists to soften.
- **Fix:** wrap each marker's hydration in try/catch, log the tag name, continue, and count
  only successes. **Regression test:** throwing-first + healthy-second → second hydrates,
  return value 1, no throw.

### HI-3 `[exec]` `AsFormAssociated` implements no FACE callbacks — `form.reset()` leaves the stale value submitted

- **Where:** `packages/blue-view-webcomponent/src/form-associated.ts:97-135`.
- **Evidence:** `[exec]` Chromium probe: `field name=rating value='5'` → `FormData` carries
  `rating=5`; `form.reset()` → the element still reports `'5'` and `FormData` still submits
  it. `formResetCallback`/`formDisabledCallback`/`formStateRestoreCallback` are all
  `undefined` on the element. jsdom cannot expose this (its shim no-ops `setFormValue`).
- **Impact:** the AD-69 D-3 FACE contract is incomplete: reset/re-enable semantics diverge
  from native controls, silently. Guide 21 advertises the mixin as the bridge.
- **Fix:** implement at least `formResetCallback()` (restore the initial/default value and
  re-`setFormValue`), plus `formDisabledCallback()`; document the lifecycle on
  `FormAssociatedElement`. **Regression test:** Playwright spec — set value, `form.reset()`,
  assert value and `FormData` cleared.

### HI-4 `[exec]` The config schema, guide and drift-spec teach a `{cipher:…}` object the resolver never decrypts

- **Where:** `packages/blue-boot/schema/application.schema.json:100-116` (`configValue`
  branch `{required:['cipher']}`), `docs/guides/03-environment-configuration.md:425`,
  `packages/blue-boot/test/config-schema.spec.ts:64`; contract:
  `packages/blue-context/src/secret-cipher.ts:73-92` and
  `packages/blue-context/src/property-resolver.ts:514-519`.
- **Evidence:** the real marker is a **string** — `parseSecretMarker` requires
  `typeof value === 'string'`, `#decrypt` returns non-strings untouched; guide §8 itself
  writes `{ "db": { "password": "{cipher:v1:…}" } }`. The schema's editor example and the
  spec's documented sample instead use `api.secretToken: { cipher: 'v1:…' }`, which the
  resolver passes through as an inert object (binding a String property then fails loud at
  boot). The schema cannot even warn: the generic `{type:'object'}` `anyOf` arm matches
  first, so the marker branch asserts nothing.
- **Impact:** a user following the framework's own editor schema writes a secret that never
  decrypts; the failure surfaces later as a confusing binding error. The regression spec
  pins the wrong form.
- **Fix:** model the marker as a string `pattern` (`^\{[a-z][a-z0-9]*(:[a-z][a-z0-9.]*)?:.+\}$`),
  drop the unreachable object branch, and correct guide 03 + the spec sample to the string
  form. **Regression test:** spec asserting `'{cipher:v1:AAAA}'` parses as a marker and
  that the object form is rejected by the schema's marker definition.

### HI-5 `[code]` The config schema and guide advertise framework keys no config-file reader consumes

- **Where:** `packages/blue-boot/schema/application.schema.json:34-99`,
  `docs/guides/03-environment-configuration.md:448-456`; readers:
  `packages/blue-boot/src/application.ts:290-360`,
  `packages/blue-management/src/management-auto-configuration.ts:49-54`,
  `packages/blue-telemetry-node/src/node-config.ts:132`.
- **Evidence:** `_configureProfiles` runs **before** `#configFileLoader.load(environment)`
  and reads only builder/env/CLI — `profiles.active|default|group` in
  `config/application.json` is inert. `management.redactHealthErrors` is a constructor
  option of `ManagementAutoConfiguration`, not an environment key. `telemetry.*` is the
  `configureTelemetry()` argument (real apps feed it from `OTEL_EXPORTER_OTLP_ENDPOINT`).
  `server.host` has zero readers repo-wide; only `server.name`/`server.port` are bound, and
  only by the example app.
- **Impact:** the highest-ROI AD-70 editor artifact promises completion/validation for keys
  that do nothing, which is worse than absence (it looks supported).
- **Fix:** either wire the namespaces through `@configurationProperties`/auto-configuration
  so the documented keys take effect, or label each section as a programmatic option
  (`x-not-read-from-config`) and keep only the truly read keys. **Regression test:** a spec
  asserting every schema namespace key is reachable by a repo read path or explicitly
  annotated.

### HI-6 `[exec]` Five app test lanes shadow the root vitest config: app tests run against built `lib/`, and nx `test` has no build dependency

- **Where:** `apps/blue-todo/vite.config.ts:9-30` and the four sibling app configs; root
  `vitest.config.ts` (aliases to `packages/*/src`).
- **Evidence:** `[exec]` each app carries its own `vite.config.ts` with a `test` block, so
  Vitest uses the nearest config and none of the `@blue/*` aliases apply — imports resolve
  through `node_modules → lib/` (built output). CI happens to run `pnpm build` before
  `pnpm test`; locally a stale `lib/` silently tests old code (`nx show project` has no
  `dependsOn: build` for `test`).
- **Impact:** green-but-misleading app lanes: a source change in `packages/*/src` is not
  exercised by app tests until a rebuild, and a missing `lib/` breaks the lane instead of
  building it.
- **Fix:** make the app configs extend/merge the root config (or import its alias table),
  and add `dependsOn: ["^build:lib"]` to the `test` target (or document the CI ordering
  contract explicitly). **Regression test:** an app spec importing `@blue/signals` and
  asserting a source-only change is visible; a gate that fails when an app config lacks the
  shared aliases.

---

## 3. Medium findings (33)

| ID     | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Fix                                                                                                                                   | Evidence |
| :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------ | :------- |
| INS-1  | `@blue/inspect` computes `hasValue` via `environment.getProperty(...)`, which runs placeholder resolution **and secret decryption** — contradicting the documented "values are never read" contract, emitting the SEC-10 fail-open warning, and throwing on a tampered marker with a decryptor wired (`packages/blue-inspect/src/config.ts:34`; `property-resolver.ts:376-380,514`). SEC-DELTA-3/BOOT-CFG-06 are the same defect.                                                                | Use `environment.hasProperty(key)` (probe: zero decryptor calls, identical output), or reword the contract to "values never surface". | `[exec]` |
| INS-2  | `no-duplicate-mapping-path` misses no-substitution template literals, aliased decorator identifiers, and the `queryMapping`/`publicMapping`/`privateMapping` decorators that register in the same radix tree (`packages/blue-oxlint-plugin/src/rules/no-duplicate-mapping-path.ts:12,112`; aliases confirmed at `packages/blue-dispatcher/src/http-method-mapping.ts:67`, `route-mapping.ts:140,148`). A real radix probe shows the template-literal pair collides (second handler unreachable). | Treat static `TemplateLiteral`s as literals, resolve imported identifiers, extend the decorator set.                                  | `[exec]` |
| INS-3  | The same rule groups by decorator **name**, not HTTP-method identity, so `@requestMapping('/y')` vs `@routeMapping('/y')` (both method-less) shadow each other without a diagnostic (`no-duplicate-mapping-path.ts:193`).                                                                                                                                                                                                                                                                        | Group by resolved method identity (verb → fixed method; method-less → `any`).                                                         | `[exec]` |
| INS-4  | `InspectRoute.name` is input-shape dependent: `RouteRegistry` yields the dotted registry key (`api.x`), raw `RouteDefinition`s yield `deriveKey(pattern)` (`x`), and the TSDoc/README claim they agree (`packages/blue-inspect/src/routes.ts:26,37`; `README.md:75`).                                                                                                                                                                                                                            | Carry the registry key on the definition (or accept keyed entries) and correct the docs.                                              | `[exec]` |
| INS-5  | `@blue/inspect` TSDoc/README reference a `blue inspect --json` CLI that AD-70 explicitly defers (`packages/blue-inspect/src/index.ts:7`).                                                                                                                                                                                                                                                                                                                                                        | Reword to the `pnpm --filter @blue/api inspect` demo.                                                                                 | `[code]` |
| INS-6  | README claims "every collection is sorted and de-duplicated", but `app.profiles` is copied verbatim from `environment.activeProfiles` (`packages/blue-inspect/src/inspect-application.ts:20-25`).                                                                                                                                                                                                                                                                                                | Sort/dedupe profiles, or scope the claim.                                                                                             | `[code]` |
| VIEW-1 | (DV2-1) `IslandViewResolver`'s default filter is the raw `customElementNamePattern`, which admits reserved names; `_loadView` then calls `new IslandView('font-face')`, which throws `FrameworkError` instead of falling through (`packages/blue-view/src/island-view-resolver.ts:56-69`, `island-view.ts:131-137`). Probe: `font-face`, `annotation-xml`, `missing-glyph`, `color-profile` all throw.                                                                                           | Use `isValidCustomElementName` as the predicate (or guard in `_loadView`).                                                            | `[exec]` |
| VIEW-2 | (SEC-DELTA-1) `ContentNegotiationViewResolver.#candidates` is an unbounded `Map` while the sibling `AbstractCachingViewResolver` gained a 1024-entry FIFO bound in the same wave (`content-negotiation-view-resolver.ts:438,484` vs `view-resolver.ts:47-53,104-108`); request-derived names come from `route.path`, so an unauthenticated scanner grows the map per request.                                                                                                                    | Share the bounded-cache helper; evict FIFO.                                                                                           | `[code]` |
| VIEW-3 | (DV2-2) `ContentNegotiationViewResolver` cache key `${name}\u0000${language ?? ''}` is NUL-ambiguous (the base resolver was fixed to a JSON tuple in the same wave) (`content-negotiation-view-resolver.ts:494`).                                                                                                                                                                                                                                                                                | Reuse the JSON-tuple key.                                                                                                             | `[exec]` |
| VIEW-4 | (DV2-4) EJS cyclic includes are newly reachable after the `filename` threading: a↔b include recursion ends in `RangeError: Maximum call stack size exceeded` plus stray `PromiseRejectCallback` rejections (`ejs-template-engine.ts:74-91`, `ejs-view.ts:163-165`).                                                                                                                                                                                                                              | Document the failure mode or add an include-depth guard.                                                                              | `[exec]` |
| REU-1  | (AR-1) `no-unsafe-view-name-literal` validates `IslandView` against the **path-safety** grammar, but IslandView's guard is the custom-element grammar: `new IslandView('MyElement' \| 'plain' \| 'admin/users')` is lint-clean yet throws.                                                                                                                                                                                                                                                       | Branch the rule per constructor (custom-element grammar for `IslandView`).                                                            | `[exec]` |
| REU-2  | (AR-2) The view-name safety predicate is implemented twice — runtime (`view-resolver.ts:210-222`, protected) and lint (`no-unsafe-view-name-literal.ts:57-64`) — a security-relevant duplicate that will drift.                                                                                                                                                                                                                                                                                  | Extract one shared predicate (or a shared vector table both suites assert).                                                           | `[code]` |
| REU-3  | (AR-3/INS-9) Route-pattern canonicalization is duplicated byte-for-byte between `RadixMetadataHandlerMapping.normalizePattern` (`radix-metadata-handler-mapping.ts:37-59`) and the lint rule (`no-duplicate-mapping-path.ts:53-84`); the rule's comment admits the mirror.                                                                                                                                                                                                                       | Export one canonicalizer from `@blue/dispatcher`; both consume it.                                                                    | `[code]` |
| REU-4  | (AR-5) `@blue/inspect` dereferences dispatcher internals (`patternsCondition.patterns`, `methodCondition.method`) because the new `getMappingEntries()` seam exposes no read model (`blue-inspect/src/mappings.ts:55-66,92-101`).                                                                                                                                                                                                                                                                | Add public accessors on `RouteMappingInfo` and use them in both packages.                                                             | `[code]` |
| REU-5  | (AR-4) The `for accepted { for candidate { canServeMediaType } }` walk is copy-pasted three times in `content-negotiation-view-resolver.ts:246-251,296-306,505-515`.                                                                                                                                                                                                                                                                                                                             | Extract `firstServableMediaType(candidates, ranges)`.                                                                                 | `[code]` |
| BOOT-1 | (BOOT-CFG-03) Guide §3.1 states schema mode never probes kebab/snake spellings, but `resolveFromSchema` passes `relaxed` through to `valueAt` (`configuration-properties.ts:437-440`).                                                                                                                                                                                                                                                                                                           | Pick one contract and pin it with a spec.                                                                                             | `[code]` |
| BOOT-2 | (BOOT-CFG-04) `declaredConfigurationProperties` claims a metadata-only fallback for throwing constructors but iterates `getOwnPropertyNames({})` and returns no keys (`configuration-properties.ts:205-212`).                                                                                                                                                                                                                                                                                    | Enumerate the `config:property:` metadata keys directly (or delete the comment).                                                      | `[code]` |
| BOOT-3 | (BOOT-CFG-05) Declared-key inspection is relaxed-binding-blind (a relaxed-bound `hostName`/`host-name` reports `hasValue:false`) and origin-blind by default (the default prototype index implements no `originOf`; the guide's `environment.originOf('server')` example is inert); a real `blue-api inspect` run emits `{key,hasValue}` only.                                                                                                                                                   | Probe the same candidate set as binding; default app environments to the flat index or document the requirement.                      | `[exec]` |
| BOOT-4 | (BOOT-CFG-08/AR-10) The hand-maintained schema has no code→schema guard: the spec only checks guide→schema, so a `TelemetryConfig`/`ManagementAutoConfigurationOptions` rename (e.g. `minimumSeverity`, already absent) rots the schema with the guard green. Framework config knowledge now lives in three copies (schema, guide table, `@configurationProperties` metadata).                                                                                                                   | Generate the framework sections from the option types (or add a type-driven subset/parity spec).                                      | `[code]` |
| BOOT-5 | (BOOT-CFG-07) No `config/application*.json` exists anywhere: the `.vscode` `fileMatch`, the guide convention and the schema are never exercised against a real file.                                                                                                                                                                                                                                                                                                                             | Add one real (or fixture) config file loaded through `StandardConfigFileLoader` and validated by the schema.                          | `[exec]` |
| WC-A   | (WC-3) A malformed `data-blue-model` silently becomes `null`, which is assigned to the component and counted as hydrated; the demo island then throws inside its render (`hydrate.ts:51,65`; `island-view.ts:53-58`).                                                                                                                                                                                                                                                                            | Distinguish absent from unparseable; keep the fallback and log.                                                                       | `[exec]` |
| WC-B   | (WC-4) `hydrateIslands` is not idempotent — a second call re-runs the model setter (and, on the legacy path, re-creates elements); only a manual re-scan does this, but a component with side effects double-subscribes (`hydrate.ts:45,79-81`).                                                                                                                                                                                                                                                 | Mark hydrated markers (`data-blue-hydrated`) and exclude them.                                                                        | `[exec]` |
| WC-C   | (WC-5) `ensureShadowRoot()` throws when a **closed** root exists (`this.shadowRoot` is null → re-attach fails) and silently returns an open root when closed was requested (`abstract-web-component.ts:311-313`).                                                                                                                                                                                                                                                                                | Cache the acquired root in a private field; assert on mode mismatch.                                                                  | `[exec]` |
| WC-D   | (WC-7) The FACE mixin has no attribute reflection: `<x-input name="x" value="5">` (server-rendered/declarative) is ignored; only the JS property sets the submitted value (`form-associated.ts:97-135`).                                                                                                                                                                                                                                                                                         | Add `observedAttributes`/`attributeChangedCallback` for `value`, or document property-only usage.                                     | `[code]` |
| WC-E   | (WC-9) The jsdom shim (no-op `setFormValue`, `form:null`, `willValidate:false`) hides the FACE submission path, and `blue-island` has **no** Playwright lane — the only verification of the AD-71 form claim is manual (side-by-side probe: Chromium real, jsdom all-false).                                                                                                                                                                                                                     | Add a `blue-island` Playwright spec (fill → submit → POST/SSE assertions); note the divergence in the shim.                           | `[exec]` |
| WC-F   | (WC-10) `TodoIsland.connectedCallback` creates an `effect` and an SSE subscription whose disposers are discarded; `AbstractWebComponent` exposes `handleDisconnect()`/`disconnectedCallback` but the demo implements neither, so DOM moves stack subscriptions (`apps/blue-island/client/main.ts:113-129`).                                                                                                                                                                                      | Store disposers and release them in `handleDisconnect()`.                                                                             | `[code]` |
| WC-G   | (WC-11) No SSE reconnect: after a server restart or network drop the island silently shows stale data (`client/main.ts:128`; `stream-to-signal.ts:28-56`). This is the documented reference integration.                                                                                                                                                                                                                                                                                         | Add a backoff reconnect loop + connection state, or document the limitation in guide 21.                                              | `[code]` |
| APP-A  | (APP-DEV-1/WC-13) The lowering plugin's policy is inconsistent across apps (blue-island unconditional, blue-todo build-only, blue-hello/views via an ineffective oxc block) and its docstring claims "build only" while blue-island registers it for dev; comments disagree about whether Vitest lowers via esbuild or oxc.                                                                                                                                                                      | One documented policy + aligned configs/comments (folds into HI-1).                                                                   | `[code]` |
| TST-A  | (TEST-4) TOL-F5 `[still-open]`: no `tsconfig.spec.json` anywhere, `pnpm typecheck` covers build config only; a probe tsconfig reproduced **76 diagnostics across 10 `blue-core` test files**.                                                                                                                                                                                                                                                                                                    | Add per-project spec typecheck (or `vitest --typecheck`) and triage.                                                                  | `[exec]` |
| TST-B  | (TEST-3/AR-12) `@blue/inspect` is the only live package without a vitest alias, and no alias-coverage gate exists (the third TOL-F6 remediation item).                                                                                                                                                                                                                                                                                                                                           | Add the alias + a packages⇄aliases gate.                                                                                              | `[code]` |
| TST-C  | (TEST-5/RES-SKIP-01) Six `test.skip` sites remain; the `If-Modified-Interceptor` enabled path is untested via an unexplained skip and two 1xx cases carry "I do not know why"; the wave-5 skipped-test policy (`implement or delete with a documented limitation`) is not applied.                                                                                                                                                                                                               | Implement or delete-with-note; at minimum attach tracking reasons.                                                                    | `[code]` |
| RES-A  | (RES-LOG-01) Wave-5's `@blue/log` adoption is incomplete: `blue-router/src/router.ts:80` (default navigation-error hook) and `blue-telemetry-web/src/browser-config.ts:138` still log via raw `console.error`; the recurrence invariant says no raw console outside the `@blue/util` leaf exception.                                                                                                                                                                                             | Route both through `getLogger` (blue-log is a cycle-free leaf) or allow-list them explicitly; a lint rule would prevent recurrence.   | `[code]` |
| SEC-A  | (SEC-DELTA-4) `ConfigurationPropertiesResult.bindings` retains **decrypted** plaintext; today both call sites use only `{ instance }`, so this is latent (`configuration-properties.ts:398,440`).                                                                                                                                                                                                                                                                                                | Redact secret-sourced entries (or drop values, keeping key+origin) and document the field.                                            | `[code]` |

---

## 4. Low / nit findings (28)

| ID     | Finding                                                                                                                                                                                                                                                                                                                    | Evidence      |
| :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| INS-7  | `InspectRoute.partition` is only ever emitted from explicit descriptors; never populated for the documented primary sources (`blue-inspect/src/types.ts:44`).                                                                                                                                                              | `[code]`      |
| INS-8  | `tablesOf` throws an opaque TypeError on `mappings: null` (`blue-inspect/src/mappings.ts:109`) — guard nullish with a typed error or `[]`.                                                                                                                                                                                 | `[exec]`      |
| VIEW-5 | (DV2-5) `normalizePattern` leaves `{*}` vs `**` in separate buckets although the radix tree collapses them, and re-canonicalizes per request in `_getHandler` (`radix-metadata-handler-mapping.ts:35-59,124`).                                                                                                             | `[code]`      |
| VIEW-6 | (DV2-3) `customElementNamePattern` is a strict ASCII subset of the spec's PCENChar grammar; spec-valid non-ASCII names (`x-føø`, `x-你好`) are rejected. Conservative, not a hole — document the restriction or widen.                                                                                                     | `[exec]`      |
| VIEW-7 | (DV2-7) `isSafeViewName` misses drive-relative `C:foo` (the check requires a separator after the colon); no traversal demonstrated on POSIX (`view-resolver.ts:206-221`).                                                                                                                                                  | `[code]`      |
| REU-6  | (AR-6/DOC2-03) `packages/blue-platform-node/README.md:129-131,148` still lists `NodeQueryValueMethodArgumentResolver`/`NodePathValueMethodArgumentResolver`, deleted in `0c4becbd`; importing per the README fails.                                                                                                        | `[exec]`      |
| REU-7  | (AR-7) The dispatcher barrel exports `MappingRegistry` although only `MappingEntry` is the manifest seam and `MappingRegistry` has no external consumer (`blue-dispatcher/src/index.ts:48`).                                                                                                                               | `[code]`      |
| REU-8  | (AR-8) `isRouteRegistry` is duck-typed but named with the `is*` prefix; STYLE_GUIDE §3.6 reserves `is*` for identity checks and names structural ones `like*` (`blue-inspect/src/routes.ts:19-22`).                                                                                                                        | `[code]`      |
| REU-9  | (AR-9) `@blue/inspect` depends on `@blue/boot` (for one function), pulling both platform tiers transitively into a tooling package; ARCHITECTURE lists direct deps only.                                                                                                                                                   | `[inference]` |
| REU-10 | (AR-11) `customElementNamePattern` is re-exported from `@blue/view`'s barrel although it is resolver-internal; export the predicate instead.                                                                                                                                                                               | `[code]`      |
| REU-11 | (AR-13) Dated docs still reference deleted symbols/scripts: `docs/migrations/2026-01-27_DOCS.md:287` (`typedoc-plugin-sig.js`), `docs/reference/2026-03-16_ARGUMENT_RESOLVER_CONVERSION_SUMMARY.md:69` (`configureStrictBrowserArgumentResolvers`), AD-07 at `docs/decisions/2026-09-05_AD07_VALIDATION.md:119`.           | `[code]`      |
| REU-12 | (AR-10 follow-on) `declaredConfigurationProperties` drops types in schema mode (always `undefined`), so the manifest's `type` is absent for schema-bound classes (`blue-boot/src/configuration-properties.ts:194-219`).                                                                                                    | `[code]`      |
| SEC-B  | (SEC-DELTA-2/WC-12) `scripts/vite-plugin-lower-decorators.mjs:23-24` matches `.ts`/`.mts`/`.tsx` but not `.cts` although the docstring lists it; every workspace `.ts` is re-transformed (no `/^\s*@/m` pre-check).                                                                                                        | `[exec]`      |
| SEC-C  | (my probe, 2026-10-07) The AD-71 demo enables `with-clear` on the Web Awesome input; when the field becomes non-empty the library `fetch()`es a `data:image/svg+xml` icon, which the framework's default CSP `connect-src 'self'` blocks — two console errors and a missing clear icon under the default security headers. | `[exec]`      |
| WC-H   | (WC-8) `name` setter cannot clear the attribute (`if (value)` only; `form-associated.ts:119-123`).                                                                                                                                                                                                                         | `[exec]`      |
| WC-I   | (WC-12) Same plugin-transform coverage note as SEC-B (whole-workspace transform cost, built-`lib/*.js` inputs out of scope).                                                                                                                                                                                               | `[exec]`      |
| APP-B  | (APP-TEST-1) `client-bundle.spec.ts:20-24` parses the bundle as a **classic script**: it catches raw decorators but would spurious-fail on legitimate ESM (`export`/`import.meta`/top-level await).                                                                                                                        | `[exec]`      |
| APP-C  | (TOL-MANIFEST-1/2) `check-manifests` rule 10 never scans app-root `*.config.ts` files (an undeclared import there is invisible), and rule 9 only inspects `vitest.config.ts` literals with `resolve(__dirname, …)` replacements (blue-todo's in-`vite.config.ts` test block is skipped).                                   | `[code]`      |
| APP-D  | (my observation) `apps/blue-island` SSE generator queues one **full model snapshot** per update with no coalescing or bound; a slow client accumulates entries (`apps/blue-island/src/island-controller.ts:150-180`) — ties into GAP-13 (SSE backpressure).                                                                | `[code]`      |
| TST-D  | (TEST-6) `--passWithNoTests` in three telemetry lanes that do have specs; redundant `vitest run test` filter in blue-todo; cwd-dependent `dist/` path in `client-bundle.spec.ts`.                                                                                                                                          | `[code]`      |
| RES-B  | (RES-EJS-TAUTOLOGY) `packages/blue-view-ejs/test/ejs.spec.ts:104-111` asserts the `[object Promise]` failure mode instead of guarding corrected behavior.                                                                                                                                                                  | `[code]`      |
| RES-C  | (RES-QS-TAUTOLOGY) The query-string bracket cases (`packages/blue-http/test/query-string.spec.ts:94-231`) restate the implementation with no ADR declaring bracket syntax permanently unsupported.                                                                                                                         | `[code]`      |
| RES-D  | (RES-AD46-DEPTH) `no-internal-file-exports` matches `src/index.ts` and one nested level only (`packages/blue-oxlint-plugin/src/rules/no-internal-file-exports.ts:14`); a two-level nested barrel escapes.                                                                                                                  | `[exec]`      |
| DOC-A  | (DOC2-05) `ARCHITECTURE.md:847` still lists the removed `domain`/`validate` packages in the isomorphic-core parenthesis.                                                                                                                                                                                                   | `[exec]`      |
| DOC-B  | (DOC2-06) `README.md:184` recommends `pnpm vitest --ui` but `@vitest/ui` is not installed.                                                                                                                                                                                                                                 | `[exec]`      |
| DOC-C  | (DOC2-07) AD-58:35 says "ships 12 rules" (now 14); qualify or drop the hard number.                                                                                                                                                                                                                                        | `[exec]`      |
| DOC-D  | (DOC2-08) Guide 21 §9 gzip figures are ~1–2 % off the committed bundle (raw numbers exact: 538.6 KB; `gzip -9` = 127.7 KB vs the stated 129.3 KB).                                                                                                                                                                         | `[exec]`      |
| DOC-E  | (my observation / AppsAndCI note) `apps/blue-api/src/inspect.ts` (AD-70 demo entry, `inspect` script) is not mentioned in `apps/blue-api/README.md`.                                                                                                                                                                       | `[code]`      |

---

## 5. Documentation drift register

| ID     | Document                                                                                 | Issue                                                                                                                                                                                                                                                                                     |
| :----- | :--------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-1  | `docs/README.md:20` (DOC2-01)                                                            | Guide range says "02–20" but 21 guides exist (19/20/21 were added recently).                                                                                                                                                                                                              |
| DOC-2  | `docs/plans/README.md` (DOC2-02)                                                         | The Completed-Reviews entry said the comprehensive-review "remediation waves proposed, not yet executed" although waves 1–5 landed (`91712f40`, `8f54a402`, `fbb5233e`, `0c4becbd`) — **fixed with this plan's commit** (the entry now records the landed waves and the post-plan fixes). |
| DOC-3  | `docs/plans/2026-10-06_COMPREHENSIVE_REVIEW_AND_MITIGATION.md:23,44-53`                  | Header still reads "Execution in progress"; the post-plan paragraph omits AD-70 (`f6cdf832`).                                                                                                                                                                                             |
| DOC-4  | `docs/plans/2026-10-06_CODE_REVIEW_AND_MITIGATION.md:26,951`                             | "A1–A5 landed" is inaccurate for A4: the `@vitest/coverage-v8` pin and the coverage lane no longer exist at HEAD.                                                                                                                                                                         |
| DOC-5  | `ARCHITECTURE.md:1112-1145` (DOC2-04)                                                    | Package-Map "Runtime deps" column omits the `@blue/log` edge added by `fbb5233e` in 9 rows; platform-web hub count says 11, manifest has 12.                                                                                                                                              |
| DOC-6  | `packages/blue-platform-node/README.md:129-131,148` (DOC2-03/REU-6)                      | Lists two deleted argument resolvers and repeats "9 argument resolvers".                                                                                                                                                                                                                  |
| DOC-7  | `docs/guides/03-environment-configuration.md:425,438` (HI-4/HI-5)                        | Editor example uses the object `{cipher:…}` form; §"Documented framework keys" presents keys that no config-file reader consumes.                                                                                                                                                         |
| DOC-8  | `packages/blue-inspect/README.md:66,75`; `src/index.ts:7` (INS-4/5/6)                    | "Every collection is sorted and de-duplicated" (profiles are not); route-name semantics misdescribed; references a nonexistent `blue inspect --json` CLI.                                                                                                                                 |
| DOC-9  | Dated migration/reference docs (REU-11)                                                  | `docs/migrations/2026-01-27_DOCS.md:287`, `docs/reference/2026-03-16_…:69`, `docs/decisions/2026-09-05_AD07_VALIDATION.md:119` reference deleted scripts/symbols; historical, but no "superseded" marker.                                                                                 |
| DOC-10 | `README.md:184`, `docs/decisions/2026-08-19_AD58…:35`, `docs/guides/21…:183` (DOC-B/C/D) | `--ui` without `@vitest/ui`; stale rule count; gzip figures.                                                                                                                                                                                                                              |

**Meta:** the hand-maintained index tables (ARCHITECTURE package map, plans/docs indexes,
guide ranges, AD counts) keep drifting one edit behind the code. Each fix below adds a
gate so the class cannot recur (see Wave 5).

---

## 6. Feature-gap refresh (industry comparison, 2026-10)

Sources: official docs/repos (URLs in the slice report, `agent://IndustryGaps-2`), peer
set Spring Boot/Modulith, NestJS, Fastify, AdonisJS, Hono, Astro, Next.js, Encore,
Quarkus, Ktor. Status verified against HEAD by grep/graft.

| ID     | Gap                                                                                   | Status at HEAD                                                                                                                                                                                                                                               | 1.0 severity | Recommendation                                                                                  |
| :----- | :------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------- | :---------------------------------------------------------------------------------------------- |
| GAP-1  | Durable jobs/queues + transactional outbox                                            | absent                                                                                                                                                                                                                                                       | high         | build: ADR + `@blue/jobs` driver SPI (Redis/SQL), outbox wired to the ORM UoW                   |
| GAP-2  | Clustering / worker offload                                                           | absent                                                                                                                                                                                                                                                       | high         | build: `blue serve --cluster <n>` fanning SIGTERM into existing graceful shutdown               |
| GAP-3  | Distributed locks / persistent schedules                                              | absent                                                                                                                                                                                                                                                       | high         | build: `@blue/locks` (Redis/PG advisory, fencing) + `@scheduled({lock})`                        |
| GAP-4  | Actuator parity (`/loggers`, `/env`, `/configprops`, health groups)                   | **executed — AD-76** (`@blue/management`: exposure model + the four endpoint classes)                                                                                                                                                                        | high         | build behind the existing management-path guard                                                 |
| GAP-5  | OTel metrics + Prometheus + semconv names                                             | **partial** — the prior review's "metrics are not OTel" was wrong: OTLP metric export and OTel counters predate the baseline; missing are the Prometheus exporter, semconv metric names (`http.server.request.duration`), and `/metrics` is proprietary JSON | high         | add Prometheus exporter + semconv emission; derive the JSON view from the meter provider        |
| GAP-6  | First-class CLI / dev loop                                                            | absent (no `bin` anywhere; `@blue/inspect` is API+demo)                                                                                                                                                                                                      | high         | build `@blue/cli` (`dev`, `generate`, `db`, `inspect`)                                          |
| GAP-7  | Migration generation + run-on-boot                                                    | **executed — AD-78** (`@blue/orm-drizzle` file migrations + snapshot generation + `migrateOnBoot`; `blue db new\|generate\|status`; committed `db/schema.json` + CI freshness gate; reference app `apps/04-blue-api`)                                        | medium       | `blue db generate` from entity metadata; `migrations.runOnBoot`                                 |
| GAP-8  | Shared-store rate limiting                                                            | **executed — AD-79** (async `RateLimiter` SPI in `@blue/rate-limit`; `@blue/redis/rate-limit` Redis fixed-window driver with TTL windows; fail-closed default)                                                                                               | medium       | Redis driver via the existing SPI                                                               |
| GAP-9  | Testcontainers / DB isolation                                                         | absent                                                                                                                                                                                                                                                       | medium       | `@blue/test-containers` glue (connection properties + migrate + rollback)                       |
| GAP-10 | Multitenancy primitives                                                               | absent                                                                                                                                                                                                                                                       | medium       | defer: ADR for tenant-context token + resolver hook                                             |
| GAP-11 | Feature flags (OpenFeature)                                                           | absent                                                                                                                                                                                                                                                       | low          | defer: `FlagEvaluator` SPI over property sources                                                |
| GAP-12 | HTTP/2–3                                                                              | absent                                                                                                                                                                                                                                                       | low          | watch: document edge termination as the supported pattern                                       |
| GAP-13 | Streaming views / SSE backpressure                                                    | partial (async-iterable view contract exists; no drain-aware writes; see APP-D)                                                                                                                                                                              | medium       | drain-aware SSE writes + bounded per-subscriber queues                                          |
| GAP-14 | i18n / RTL                                                                            | partial (messages/Intl/locale done; RTL never adopted, no ADR)                                                                                                                                                                                               | medium       | record the RTL deferral in an ADR or implement `dir` flow                                       |
| GAP-15 | Forms / file uploads, OpenAPI, auth, streaming SSR                                    | present (multipart AD-26, OpenAPI AD-35, sessions/JWT AD-33/68, islands AD-69/71)                                                                                                                                                                            | —            | no action                                                                                       |
| GAP-16 | Migration lifecycle depth (down/rollback, dry-run, checksums, advisory lock)          | absent — forward-only runner, no checksum verification, no `--sql` preview (REV-007, 2026-10-08 review)                                                                                                                                                      | medium       | `down()` support + `migrate --to <n> --sql`; journal checksums; lock key for multi-replica boot |
| GAP-17 | Migration DDL fidelity (FK/index/UNIQUE/CHECK projection)                             | absent — projection models columns only; relation metadata is not expressed (REV-005, 2026-10-08 review; guide 27 documents the ceiling)                                                                                                                     | medium       | `predicate: 2` — project relations/FKs + indexes from `@blue/orm` metadata                      |
| GAP-18 | Actuator extended surface (`/sessions`, `/info`, `/shutdown`, health-group wildcards) | absent — AD-76 covers health/metrics/loggers/env/configprops (REV plan P2, 2026-10-08)                                                                                                                                                                       | low          | extend the exposure model; wildcard group includes                                              |
| GAP-19 | Prometheus naming conventions (unit-suffixed names)                                   | absent — `http.server.request.duration` exports without the Micrometer-style `_seconds` suffix (REV-008, 2026-10-08 review)                                                                                                                                  | low          | unit-derived name suffix with a relabel opt-out                                                 |
| GAP-20 | Single metric plane (`/metrics` + provider multi-slot)                                | partial — feature aggregator now backs `/metrics` as the fallback (REV-003); one current slot only, silent replacement (REV-011)                                                                                                                             | medium       | provider stack (register/unregister restores); merge feature + OTel planes in one endpoint      |

**Movement since `96337f24`:** AD-69/71 close the component-library item; AD-70 opens the
editor-tooling path (manifest + schema + rules) without shipping a CLI; the distributed axis
(jobs/cluster/locks) and the ops/DX axis (actuator/CLI/migrations/testcontainers) are
unchanged and remain the Wave-6 roadmap input.

---

## 7. Prior-fix verification and carried-forward residuals

**Verified fixed at HEAD** (independent probes): CI-B1 (e2e job now builds workspace libs —
fresh-checkout simulation fails without `pnpm build`, succeeds after), APP-B1 (`#/account`,
`#/account/settings` render `account-app`; 9 shell-composition tests green), APP-N5
(blue-island `test` builds the client first; clean-checkout run green), SEC-B1 (passwordless
account takeover fixed — `credentials-auth-adapter.ts:109-112` rejects null/empty hashes),
DSV-SEC-1 (traversal guard holds against literal, matrix-suffixed, encoded and Windows
forms; loaders contain), DSV-B1 (throwing render → terminal 500), DSV-VIEW-1/2/3
(406 semantics, request-copy negotiation, JSON-tuple + bounded view cache), DSV-EJS-1
(relative includes), DSV-DISP-2/3/4/5 (radix dedup, error-map hierarchy, interceptor guard),
DSV-DUP-1 (removed node query/path shadow resolvers; docs drift excepted), Redis CI lane,
graft pin, OpenAPI security forwarding, secret-redaction invariant, A1/A2/A3/A5.

**Carried forward (still open / deferred):**

| Item                                                        | Status at HEAD                                                                                               | Owner action               |
| :---------------------------------------------------------- | :----------------------------------------------------------------------------------------------------------- | :------------------------- |
| TOL-F5 test-file typecheck lane                             | **closed in the follow-up sweep** — `tsconfig.spec.json` + full triage                                       | TST-A (this revision)      |
| TEL-08 client byte-size seam (`onSend` not consumed)        | **closed in the follow-up sweep** — `countSocketClientBytes` + co.                                           | TEL-08 (this revision)     |
| REU-9 inspect → boot transitive weight                      | **closed in the follow-up sweep** — metadata relocated to `@blue/context`                                    | REU-9 (this revision)      |
| SEC-B/WC-I plugin probe home                                | **closed in the follow-up sweep** — `test:tooling` node:test lane                                            | SEC-B/WC-I (this revision) |
| Raw-console invariant (`blue-router`, `blue-telemetry-web`) | recurrence item open (RES-A)                                                                                 | Wave 5                     |
| AD-46 rule depth (`src/**/index.ts` deeper than one level)  | partial (RES-D)                                                                                              | Wave 3                     |
| Skipped-test policy (six sites)                             | partial (TST-C)                                                                                              | Wave 1                     |
| `[object Promise]` / bracket-syntax tests                   | test-quality items (RES-B/C)                                                                                 | Wave 5                     |
| Wave-6 GAP-1..15 roadmap                                    | ADR-gated; GAP-1 (AD-72), GAP-3 (AD-73), GAP-2 (AD-74), GAP-6 (AD-75), GAP-4 (AD-76), GAP-5 (AD-77) executed | Wave 6                     |
| Doc hygiene for both 2026-10-06 plans + indexes             | drift (DOC-2..4, DOC-5)                                                                                      | Wave 5                     |

---

## 8. Mitigation plan

### Wave 1 — Build, DX and test-lane integrity (block + highs)

| Items                | Change                                                                                                                                                                                                          | Regression test                                                                             |
| :------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| BLK-1                | Delete `blue-view-webcomponent/test/benchmark.spec.ts` (or port its fixtures in-repo); add an out-of-repo-import assertion to `scripts/check-manifests.mjs`.                                                    | `vitest list` + manifest check on a `git archive` checkout.                                 |
| HI-1 / APP-A         | Apply `lowerDecorators()` unconditionally in `blue-hello`, `blue-views` (delete the dead `oxc.tsconfigRaw` blocks) and `blue-todo` dev; document one plugin policy.                                             | Per-app bundle-parse spec + dev-transform assertion; CI parses every `apps/*/dist/**/*.js`. |
| HI-6 / TST-B / TST-D | App configs reuse the root alias table (or `mergeConfig`), `test` targets depend on `^build:lib`; add the `@blue/inspect` vitest alias + a packages⇄aliases gate; remove redundant `--passWithNoTests`/filters. | An app spec asserting a source-only change is visible; alias-coverage gate.                 |
| TST-A (TOL-F5)       | Add per-project `tsconfig.spec.json` (or `vitest --typecheck`) and triage the reproduced diagnostics.                                                                                                           | `pnpm typecheck` covers `*.spec.ts`; lane red on an intentional type error.                 |
| APP-C                | Extend `check-manifests` rule 9/10 to app-root config files, `vite.config.*` test blocks, and alternative alias spellings.                                                                                      | Fixture app with an undeclared import in `vite.config.ts` is reported.                      |
| TST-C                | Resolve the six skips (implement or delete-with-note), starting with `If-Modified-Interceptor`.                                                                                                                 | No unexplained `test.skip` remains (lint-visible).                                          |

### Wave 2 — AD-70 substrate truth (config schema + introspection)

| Items                           | Change                                                                                                                                                                  | Regression test                                                            |
| :------------------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| HI-4 (BOOT-CFG-01)              | Model `{cipher:…}` as a string pattern; fix guide 03 + the spec sample; drop the unreachable object branch.                                                             | Marker string accepted; object rejected; sample fixture corrected.         |
| HI-5 (BOOT-CFG-02)              | Wire `profiles.*`/`telemetry.*`/`management.*` (or annotate them `x-not-read-from-config` and trim the schema to read keys); add a real config fixture (BOOT-5).        | Schema-key reachability spec + loader/schema round-trip on a fixture file. |
| INS-1 (SEC-DELTA-3/BOOT-CFG-06) | `collectConfig` uses `environment.hasProperty`; reword the never-values contract.                                                                                       | Counting/throwing decryptor probe: zero calls, no throw.                   |
| BOOT-1..3                       | Pin the schema-mode `relaxed` contract; implement or delete the throwing-constructor fallback; make declared-key probing relaxed-aware and fix `originOf` availability. | Specs for each documented behavior; guide updated.                         |
| BOOT-4 (AR-10)                  | Generate the framework schema sections from option types (or a type-driven subset/parity spec) and add the reverse drift check.                                         | Schema⇄type parity spec fails on a renamed option.                         |
| INS-5/6/7/8                     | Correct the README/TSDoc claims (CLI, sorting, partition), guard nullish `mappings`, sort/dedupe profiles.                                                              | Spec for profile determinism + nullish input; docs updated.                |

### Wave 3 — Lint-rule fidelity and shared canonicalizers

| Items             | Change                                                                                                                                                                  | Regression test                                                               |
| :---------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------- |
| INS-2/INS-3       | Rule accepts static template literals, resolves imported decorator identifiers, covers `queryMapping`/`publicMapping`/`privateMapping`, groups by HTTP-method identity. | RuleTester invalid cases for each bypass/shadowing pair.                      |
| REU-1             | Branch the view-name rule per constructor (custom-element grammar for `IslandView`).                                                                                    | `new IslandView('MyElement')` reports; `new IslandView('todo-app')` does not. |
| REU-2/REU-3/REU-5 | One shared `isSafeViewName` predicate, one route-pattern canonicalizer (exported from `@blue/dispatcher`), one `firstServableMediaType` helper.                         | Shared vector tables asserted by both runtime and rule suites.                |
| REU-4             | Public accessors on `RouteMappingInfo`; inspect stops reaching into conditions.                                                                                         | Multi-pattern mapping yields one row per pattern via the accessor.            |
| RES-D             | Widen `isPublicIndexFile` to `src(?:/[^/]+)*/index.ts` + fixture.                                                                                                       | Two-level nested barrel fixture flagged.                                      |
| REU-6..12         | Barrel/API tidy-up (`MappingRegistry`, `isRouteRegistry`→`likeRouteRegistry`, `customElementNamePattern`, inspect dependency weight, schema-mode types).                | Typecheck/lint; optional manifest assertion on `@blue/inspect`'s closure.     |

### Wave 4 — View/web-component hardening

| Items                 | Change                                                                                                                                                                                                                       | Regression test                                                                                     |
| :-------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| VIEW-1                | `IslandViewResolver` uses `isValidCustomElementName`; reserved names fall through.                                                                                                                                           | `resolveViewName('font-face') === null`, no throw.                                                  |
| VIEW-2/VIEW-3 (SEC-A) | Bound `ContentNegotiationViewResolver.#candidates` (shared FIFO helper) and switch to the JSON-tuple key; redact secret values in `bindings`.                                                                                | >MAX distinct names keep the map bounded; NUL pairs resolve distinctly; bindings have no plaintext. |
| HI-2/WC-A/WC-B/WC-C   | `hydrateIslands` per-marker isolation + idempotence marker; malformed-model handling keeps the fallback; `ensureShadowRoot` caches the acquired root.                                                                        | Throwing-first island leaves the second hydrated; double call hydrates once; closed-root reuse.     |
| HI-3/WC-D/WC-H        | FACE callbacks (`formResetCallback`, `formDisabledCallback`), `value` attribute reflection, `name` clearing; document the lifecycle.                                                                                         | Playwright FACE spec (reset/disabled/declarative value).                                            |
| WC-E                  | Add a `blue-island` Playwright lane (fill → submit → POST → SSE) mirroring `blue-todo`'s.                                                                                                                                    | The lane itself; jsdom shim comment notes the divergence.                                           |
| WC-F/WC-G/APP-D       | Dispose effect + SSE subscription in `handleDisconnect`; reconnect with backoff; coalesce/bound the SSE snapshot queue.                                                                                                      | Disconnect/reconnect spec (one subscription); stream-end resubscribe; queue bound.                  |
| VIEW-4..7, SEC-B/C    | Include-depth guard or documented cycle failure; `{*}`/`**` canonicalization + cached key; document ASCII element-name restriction; `C:` guard; `.cts` regex; CSP/data-URI guidance for adopted libraries (guide 21 + demo). | Bounded include error; reachability specs; plugin `.cts` unit test; guide note.                     |

### Wave 5 — Documentation, indexes and test-quality debt

| Items          | Change                                                                                                                                                                                                                                                                         |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| DOC-1..10      | Fix indexes/ranges (guide range, plans index status, ARCHITECTURE package map incl. the `@blue/log` edges, README `--ui`, AD-58 count, guide 21 gzip), the platform-node README resolver list, the AD-70-related guide 03/README claims, and the dated-doc superseded markers. |
| RES-A          | Migrate `blue-router`/`blue-telemetry-web` to `@blue/log` + add a lint rule banning raw `console.warn/error` under `packages/*/src` (allow-list `blue-util`, `blue-log`).                                                                                                      |
| RES-B/RES-C    | Replace the `[object Promise]` and bracket-syntax assertions with decision-backed tests (or delete with an ADR note).                                                                                                                                                          |
| Gate additions | Guide-range check, plans-index status check, ARCHITECTURE deps-vs-manifest check, README symbol-existence check (extend `scripts/check-manifests.mjs`).                                                                                                                        |

### Wave 6 — Product roadmap (ADR-gated, unchanged from the prior review)

GAP-3 → GAP-1 → GAP-2 (dependency cluster: locks, jobs/outbox, cluster) first; GAP-4/GAP-5
(actuator parity, Prometheus/semconv — reuse the existing meter provider) in parallel;
GAP-6/7 (CLI, migration generate) as the DX track; GAP-8/9/13 (shared-store limits,
testcontainers, SSE backpressure incl. APP-D) as capacity work; GAP-10/11/12/14 get ADRs
only until a consumer exists. Each requires an ADR + owner sign-off before code.
**Movement:** GAP-1 closed by AD-72 (`d950ad5c`); GAP-3 **executed** —
[AD-73](../decisions/2026-10-07_AD73_DISTRIBUTED_LOCKS.md) (accepted and
implemented 2026-10-07: `@blue/locks` SPI + `InProcessLockDriver`,
`@blue/redis/locks` driver, `@scheduled({ lock })`, `lockDriver` bean —
see the [companion plan](2026-10-07_DISTRIBUTED_LOCKS.md)); GAP-2
**executed** — [AD-74](../decisions/2026-10-07_AD74_CLUSTERING.md)
(`@blue/cluster` supervisor: N worker slots, signal relay into each child's
graceful shutdown, bounded backoff + fail-closed guard — the
[companion plan](2026-10-07_CLUSTERING.md)). The Wave-6 dependency cluster
(GAP-3 → GAP-1 → GAP-2) is fully landed; GAP-6 **executed** —
[AD-75](../decisions/2026-10-07_AD75_FRAMEWORK_CLI.md) (`@blue/cli` on
`@oclif/core` v5: serve with the `--cluster` surface, dev, generate,
db:migrate, inspect, doctor — the [companion plan](2026-10-07_FRAMEWORK_CLI.md)).
Remaining Wave-6 items stay ADR-gated. **GAP-4 executed** (2026-10-08) —
[AD-76](../decisions/2026-10-08_AD76_ACTUATOR_PARITY.md) + the
[companion plan](2026-10-08_ACTUATOR_PARITY.md): `/loggers`, `/env`,
`/configprops`, health groups/components, and the opt-in exposure model in
`@blue/management` (guide 26). **GAP-5 executed** (2026-10-08) —
[AD-77](../decisions/2026-10-08_AD77_PROMETHEUS_METRICS.md) + the
[companion plan](2026-10-08_PROMETHEUS_METRICS.md): the
`metricExporter: 'prometheus'` pull reader on the existing meter provider,
the semconv `http.server.request.duration` histogram from
`HTTPServerInstrumentation`, and the meter-derived `/metrics` view
(Prometheus text by default, JSON on an explicit `Accept: application/json` —
the `{ features }` aggregator document is gone). **GAP-7 executed** (2026-10-08) —
[AD-78](../decisions/2026-10-08_AD78_MIGRATION_GENERATION.md) + the
[companion plan](2026-10-08_MIGRATION_GENERATION.md) + guide 27:
`db/migrations/<NNNN>-<slug>.ts` file migrations with a loader
(`@blue/orm-drizzle`), entity-metadata generation against a committed
`db/schema.json` projection (freshness-gated in CI), `migrateOnBoot`
(`migrations.runOnBoot` via the app's config file), and `blue db
new|generate|status` closing the AD-75 `db:*` remainder. **GAP-8 executed**
(2026-10-08) — [AD-79](../decisions/2026-10-08_AD79_SHARED_STORE_RATE_LIMITING.md)

- the [companion plan](2026-10-08_SHARED_STORE_RATE_LIMITING.md): the
  `RateLimiter` SPI (`consume` async per AD-39) moves to the new
  `@blue/rate-limit` leaf (policy/result/guard/`FixedWindowRateLimiter`/
  `RATE_LIMITER` token), the interceptor awaits and the bean is
  token-registered, and `@blue/redis/rate-limit` ships the shared-store
  fixed-window driver (one Lua script per consume: INCR/PEXPIRE-on-first/
  PTTL, namespace-scoped keys, windows anchored at first request,
  fail-closed default with a documented fail-open option) — guide 11 §5 and
  guide 16 updated. GAP-9..15 stay ADR-gated.

### Wave 7 — Verification

Per-wave fail-before/pass-after tests, then the full gate set (§9) plus the new gates:
bundle-parse for every app, alias existence, schema⇄type parity, out-of-repo-import
assertion, doc-index checks, and the new Playwright lanes. Close with a clean
`git status`, `pnpm doc` freshness, and a `graft build` refresh.

---

## 9. Verification protocol

```bash
# Full gate set (all must pass)
pnpm build && pnpm test && pnpm test:tooling && pnpm lint && pnpm format:check && pnpm docs:links \
  && pnpm audit --prod && pnpm manifest:check && pnpm agents:check \
  && pnpm typecheck && pnpm doc && git diff --exit-code -- packages doc
# (follow-up: `pnpm typecheck` also runs the spec lane — `tsc -p tsconfig.spec.json`
# covers every package/app src AND test file; `pnpm test:tooling` is the node:test lane)

# Wave-specific probes (throwaway; never committed)
#  CI:        git archive HEAD | tar -x -C /tmp/x && pnpm install --frozen-lockfile
#             && pnpm build && pnpm test   # must pass without /home/jeff/Workspace/todomvc
#  apps:      per-app `vite build` + `node --check` (or vm module parse) on every dist/*.js
#  dev:       `vite dev` + curl a decorator-bearing module -> no `@decorator` token
#  schema:    object {cipher:'v1:…'} rejected; string '{cipher:v1:…}' accepted + decrypts
#  inspect:   environment with a counting/throwing SecretDecryptor -> zero calls, no throw
#  lint:      RuleTester invalid cases: template-literal duplicate, aliased decorator,
#             @queryMapping/@publicMapping duplicate, @requestMapping vs @routeMapping pair
#  views:     resolveViewName('font-face') -> null; >1024 names keep #candidates bounded
#  islands:   throwing-first island does not block the second; double hydrateIslands -> 1 run
#  FACE:      Chromium: form.reset() clears value+FormData; disabled fieldset reflects
```

Acceptance for closure: every block/high item has a fail-before/pass-after test; every
medium item is fixed or explicitly deferred here with a reason; the gate set is green on a
fresh checkout; `graft build` refreshed.

---

## 10. Execution log (2026-10-07)

All waves except the ADR-gated roadmap were executed in this cycle. Every landed item
carries its regression test; the full gate set (§9) is green with regenerated API docs.

### Landed

- **Wave 1 — build / CI / test lanes.** BLK-1: the out-of-repo benchmark spec is deleted and
  `check-manifests` rule 12 fails any relative import that escapes the repository. HI-1: all
  five apps apply `lowerDecorators()` for build **and** dev (the ineffective `oxc` blocks are
  gone), each app gained a bundle-parse spec (`vite build && vitest run`) and `blue-todo` a
  dev-transform spec. HI-6: shared `vitest.aliases.ts`, per-app `vitest.config.ts` (app tests
  resolve `packages/*/src`), nx `test` → `^build:lib`, `@blue/inspect` alias + rule 11 alias
  coverage. APP-C: rules 9/10 closure (config files, `vite.config.*` test blocks, alternate
  alias spellings). TST-C: three stale skips un-skipped, one tautology deleted, three
  conditional gates documented. TST-D: redundant flags/filters removed.
- **Wave 2 — boot / inspect.** HI-4: the schema models the secret marker as a **string**
  (`$defs.secretMarker`), guide 03 and the spec sample corrected. HI-5: non-read namespaces
  and `server.host` carry `x-blue-read-from-config: false` with a reachability spec. BOOT-1..5:
  schema-mode exact keys, real metadata-only declared fallback, `relaxedKeyCandidates` shared
  by binding and inspection, schema⇄type parity spec, real config fixtures through the loader.
  SEC-A: `bindings` never holds decrypted plaintext. INS-1: presence-only probing (zero
  decryptor calls, no throw). INS-4..8: keyed route entries, sorted/de-duplicated profiles,
  dead `partition` dropped, typed nullish error, REU-8 rename.
- **Wave 3 — lint rules / views.** INS-2/INS-3: template literals, aliased decorators,
  `queryMapping`/`publicMapping`/`privateMapping` (+ socket/stomp families, evidence-backed)
  and HTTP-method-identity grouping. REU-1: `IslandView` validated against the custom-element
  grammar. RES-D: any-depth `src/**/index.ts`. Parity specs drive both rule predicates against
  the runtime `isSafeViewName` / `canonicalizeRouteMappingPath`. VIEW-1..5/7: reserved names
  fall through, `BoundedCache` + JSON-tuple key, `{*}`/`**` folded with a cached canonical key,
  shared `firstServableMediaType`, `EJSIncludeCycleError`, drive-relative rejection; VIEW-6 is
  documented as the deliberate ASCII restriction. REU-2..5/7/10: single shared predicate,
  canonicalizer and negotiation walk; `MappingRegistry` and the raw pattern no longer exported.
- **Wave 4 — web components / island.** HI-2: per-marker hydration isolation (logged through
  `@blue/log`). WC-A: malformed models keep the server fallback. WC-B: `data-blue-hydrated`
  idempotence. WC-C: acquired shadow root cached, mode mismatch is an error. HI-3/WC-D/WC-H:
  FACE lifecycle (`formResetCallback`, `formDisabledCallback`, `formStateRestoreCallback`,
  `value` attribute reflection, `name` clearing). WC-E: a Playwright lane covers DSD first
  paint → hydration → FACE submit → SSE with zero page errors, and runs in CI's e2e job
  (browsers shared with the todo lane). WC-F/WC-G: disposers in
  `handleDisconnect`, bounded-backoff reconnect with visible state. APP-D: SSE snapshots
  coalesce into one bounded slot. SEC-C: the demo widens `connect-src` with `data:` (guide 21
  §9 documents the requirement); SEC-B/WC-I: `.cts` coverage + decorator pre-check.
- **Wave 5 — docs / quality.** DOC-1..10 fixed (guide range, both 2026-10-06 plan statuses,
  ARCHITECTURE package map incl. the new `@blue/log` edges, platform-node README resolver list,
  dated-doc superseded markers, README `--ui`). RES-A: `blue-router`, `blue-telemetry-web` and
  `blue-view-webcomponent` log through `@blue/log`, guarded by the new
  `@blue/no-raw-console` rule. RES-B/RES-C: the defect-pinning EJS case and the redundant
  bracket restatements are replaced by decision-backed assertions.

### Follow-up closure — the 2026-10-07 deferred sweep (at `d950ad5c`)

The four actionable deferred items above the ADR gate were executed in a
follow-up pass (this revision). Each landed with its regression coverage; the
full gate set including the new spec-typecheck lane is green.

- **TST-A / TOL-F5** — resolved. Root `tsconfig.spec.json` typechecks every
  package/app `src` **and** `test` file (extends `tsconfig.build.json`, so it
  enforces exactly the build chain's erasable-syntax policy; `strict`,
  `lib: ES2024 + DOM + DOM.Iterable`, `types: [node, vitest/globals]`, and a
  `paths` table mirroring `vitest.aliases.ts` ordering, subpath families
  first). `pnpm typecheck` now appends `tsc -p tsconfig.spec.json` to the
  per-project `tsc -b`; the lane is red on an intentional type error. The
  ~900-diagnostic residual (re-probed at `d950ad5c`) was triaged to zero by
  fourteen parallel per-package slices — test-only typing changes (annotations,
  explicit params, casts, null guards), every touched package lane green.
  Two config causes accounted for a large share: the lane must NOT inherit the
  IDE-only `erasableSyntaxOnly` (the build chain doesn't) and must carry the
  per-project `lib`/globals settings explicitly.
- **REU-9** — resolved. The config-metadata machinery
  (`declaredConfigurationProperties`, `relaxedKeyCandidates`, `toLookupKey`,
  the metadata-key constants, `getMetadata`) moved to
  `@blue/context/src/configuration-metadata.ts` — the decorators that WRITE
  those metadata keys live in context, so the readers sit beside them.
  `@blue/boot` re-exports both public functions unchanged (API continuity)
  and imports the shared pieces; `@blue/inspect` now depends on `@blue/context`
  only (`@blue/boot` moved to devDependencies — its spec fixtures use the
  boot decorator), so the tooling runtime closure no longer pulls the boot
  tree. ARCHITECTURE package map and the inspect README corrected.
- **TEL-08** — resolved. The `onSend` seam is now consumed: the new
  `countSocketClientBytes()` wires exact wire-byte metrics through the
  option (symmetric with `countSocketClientStatus`), the client exposes
  `SocketClient.onSendWired`, and the instrumentation's `send` wrap skips
  its own payload estimation for seamed clients — bytes count exactly once,
  per write (buffered flushes and retried writes included). Spec pins the
  buffered-while-connecting → flush semantics.
- **SEC-B/WC-I** — resolved. The plugin probes now live in a durable lane:
  `scripts/test-lower-decorators.mjs` (`node --test`, deliberately outside
  vitest's `*.test.*` glob so a root `vitest run` cannot collect it) under
  `pnpm test:tooling`, wired into the quality CI job.
- **GAP-3 (Wave 6)** — executed on ADR sign-off: [AD-73](../decisions/2026-10-07_AD73_DISTRIBUTED_LOCKS.md)
    - [companion plan](2026-10-07_DISTRIBUTED_LOCKS.md) + guide 23. `@blue/locks`
      (`LockDriver` SPI + `InProcessLockDriver`), `@blue/redis/locks`
      (`RedisLockDriver`, Lua, live-lane verified), `@scheduled({ lock })`
      (runner acquire/finally-release, decoration-time validation), and the
      `lockDriver` bean — the Wave-6 dependency cluster's second item lands.
- **GAP-2 (Wave 6)** — executed on ADR sign-off: [AD-74](../decisions/2026-10-07_AD74_CLUSTERING.md)
    - [companion plan](2026-10-07_CLUSTERING.md) + guide 24. `@blue/cluster`
      (`ClusterRunner`: N replicated worker slots with `BLUE_CLUSTER_SLOT`/`SIZE`
    - `PORT` derivation, `SIGINT`/`SIGTERM` relay into each child's own
      graceful shutdown, bounded-backoff respawns behind a fail-closed
      crash-loop guard, second-signal abort) — unit + real-process lanes green;
      the Wave-6 dependency cluster is now fully landed.
- **GAP-6 (Wave 6)** — executed on ADR sign-off + web research:
  [AD-75](../decisions/2026-10-07_AD75_FRAMEWORK_CLI.md) + companion plan +
  guide 25. `@blue/cli` (bin `blue`) on `@oclif/core` v5 as an embedded
  library: `serve` (the AD-74 `--cluster` surface), `dev`, `generate`,
  `db:migrate`, `inspect`, `doctor`. Scripts run shell-free (signals reach
  the app — a substrate finding fixed in `@blue/cluster`'s timers and
  races along the way); real-bin integration lane green.
- **GAP-8 (Wave 6)** — executed on ADR sign-off: [AD-79](../decisions/2026-10-08_AD79_SHARED_STORE_RATE_LIMITING.md)
    - [companion plan](2026-10-08_SHARED_STORE_RATE_LIMITING.md) +
      guide 11 §5/guide 16. `@blue/rate-limit` (`RateLimiter` SPI with async
      `consume`, `validateRateLimitPolicy`, `likeRateLimiter`,
      `FixedWindowRateLimiter`, `RATE_LIMITER` token), the platform cutover
      (interceptor awaits, bean `@entry(RATE_LIMITER)`, `src/rate-limit.ts`
      deleted), and `@blue/redis/rate-limit` (`RedisRateLimiter`: Lua
      INCR/PEXPIRE-on-first/PTTL fixed windows keyed
      `blue:rl:<ns>:<windowMs>:<key>`, fail-closed default, `fail-open` logs
      via `@blue/log`) — the live two-node lane shares one budget across two
      connections (the lock lane's pattern); gate set green.

### Deferred (reason)

| Item                   | Reason                                                                                                                                                                                                                                                                    |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Wave 6 / GAP-1..15** | ADR-gated; the dependency cluster landed (GAP-1 AD-72, GAP-3 AD-73, GAP-2 AD-74) and GAP-4..8 executed (AD-76..79). Remaining items untouched by design: each needs an ADR + owner sign-off (testcontainers, SSE drain, multitenancy, feature flags, HTTP/2–3, i18n/RTL). |

### Final verification

`pnpm build` 40/40 · `pnpm test` 83 tasks (47 projects) · `pnpm lint` 0 diagnostics ·
`pnpm format:check` 1662 files · `pnpm docs:links` 281/1052 · `pnpm audit --prod` clean ·
`pnpm manifest:check` · `pnpm agents:check` · `pnpm typecheck` · `pnpm doc` exit 0
(regenerated docs committed with the wave).

**Follow-up sweep verification (this revision):** the full gate set re-run at the
post-sweep HEAD — `pnpm build` 41/41 · `pnpm test` 60 projects (98 nx tasks) ·
`pnpm lint` 0 diagnostics · `pnpm format:check` clean · `pnpm docs:links` ·
`pnpm audit --prod` clean · `pnpm manifest:check` · `pnpm agents:check` ·
**`pnpm typecheck` now includes the spec lane** (`tsc -p tsconfig.spec.json`:
904 diagnostics at the sweep start → **0**) · `pnpm test:tooling` (node:test lane,
5/5) · `pnpm doc` exit 0, regenerated docs committed with the sweep ·
`graft build` refreshed.

---

## Appendix A — Review slices and probe artifacts

| Slice              | Key probes (all throwaway, deleted)                                                                                                                                                                                                                           |
| :----------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| InspectPkg         | fixture app + real `RadixMetadataHandlerMapping`/`RouteRegistry` vs the manifest; RuleTester bypass cases; decryptor-count probe.                                                                                                                             |
| BootSchema         | `z.fromJSONSchema` validation matrix; runtime marker/decrypt behavior; `blue-api inspect` run.                                                                                                                                                                |
| DispatcherViews    | 406/no-candidate behaviour; traversal battery (literal/encoded/Windows); CNVR key collision; EJS cycle; element-name grammar.                                                                                                                                 |
| WebComponentIsland | 15 + 27 specs; jsdom failure/idempotence/closed-root probes; Chromium FACE vs shim; dev-server transforms.                                                                                                                                                    |
| DocsDrift          | `pnpm docs:links`; guide/plans/index range diffs; claim-by-claim ADR/guide verification; `gzip -9` re-measure.                                                                                                                                                |
| TestLanes          | nx target inventory (47); skip inventory (6); `vitest list`; probe `tsconfig` for spec diagnostics (76 errors).                                                                                                                                               |
| SecurityDelta      | traversal battery through the real resolvers/loader; inspect exposure check; XSS grep; oxlint enforcement; package audit.                                                                                                                                     |
| ArchReuse          | duplication pairs (predicate/canonicalizer/negotiation walk); dead-reference greps; dependency closure.                                                                                                                                                       |
| AppsAndCI          | fresh-checkout e2e simulation; app builds even per app; dev-server module fetch; routing specs.                                                                                                                                                               |
| ResidualCheck      | every tracked residual re-checked at HEAD; doc-staleness diff.                                                                                                                                                                                                |
| IndustryGaps       | peer primary sources + repo-state confirmation per gap.                                                                                                                                                                                                       |
| Integrator (self)  | full gate set; `blue-hello` bundle `node --check`; `blue-todo` dev module fetch; guide-03 vs `parseSecretMarker`; live island run (DSD → hydrate → FACE submit → SSE snapshot) in headless Chromium; CI-layout resolution arithmetic; CSP/`data:` icon probe. |

## Appendix B — Finding counts

| Class                          | Count                                            |
| :----------------------------- | :----------------------------------------------- |
| Block                          | 1                                                |
| High                           | 6                                                |
| Medium                         | 33                                               |
| Low/nit                        | 28                                               |
| Documentation register entries | 10                                               |
| Verified-fixed prior findings  | 17                                               |
| Carried-forward residuals      | 8                                                |
| Industry gaps (refreshed)      | 15 (10 open, 4 partial, 1 present + corrections) |
