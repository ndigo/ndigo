# Actuator parity — `loggers`, `env`, `configprops`, health groups — `@ndigo/management`

**Date:** 2026-10-08
**Status:** Executed (2026-10-08 — see §8)
**Decision:** [AD-76](../decisions/2026-10-08_AD76_ACTUATOR_PARITY.md)
**Scope:** GAP-4 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6; refreshed in
`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION_AD72_75.md` §5): actuator
parity — `/loggers`, `/env`, `/configprops`, and health **groups** — built
behind the existing management-path guard, so the management surface covers
the operations endpoints every peer framework ships.

---

## 1. Problem

`@ndigo/management` today serves exactly `/health` (AD-36: `{ status,
components, timestamp }`, 503-on-DOWN, error redaction) and `/metrics`
(proprietary per-feature JSON, tracked separately by GAP-5). The operations
playbook for every peer framework (Spring Boot /actuator, Micronaut, Quarkus
management interfaces) includes at least: log-level inspection and live
changes, environment/source visibility, bound-configuration introspection,
and composed health views (groups). Operators moving from those stacks expect
the same four verbs; the repo's own 2026-10-07 review rates actuator parity
**high** and 1.0-blocking.

## 2. Current state (verified 2026-10-08 at `14801f87`)

| Seam             | What exists                                                                                                                                                                                | What is missing                                                 |
| :--------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| Management paths | `/health`, `/metrics` controllers (`@requestMapping`), open by default, `accessGuard` scoped via `MANAGEMENT_PATHS`                                                                        | guard path list hard-coded; no exposure model                   |
| Health           | `HealthRegistry` (register/unregister, `checkAll()` → `{status, components, timestamp}`; concurrent probes; redaction; error marker)                                                       | component/group selection (`check(names?)`), group config       |
| Metrics          | `FeatureMetricAggregator` + `MetricsController` (proprietary JSON) — **GAP-5, out of scope here**                                                                                          | —                                                               |
| Loggers          | `@ndigo/log` `LoggerFactory`: global settings + revision, `ConfigurableLogger` with a **handle-local** `#thresholdOverride` (`logger-factory.ts:101-128`)                                  | per-name shared overrides, name enumeration, HTTP surface       |
| Config classes   | `declaredConfigurationProperties(ctor)` (keys + types, never values; schema-mode types included — REU-12); `@ndigo/inspect` enumerates via an explicit class list (`configurationClasses`) | an HTTP surface; no registry of classes — app supplies the list |
| Environment      | `MutablePropertySources.entries()` (name/source pairs in precedence order); `FlatMergedIndex.originOf` (top-level granularity); `environment.activeProfiles`                               | an HTTP surface; sanitization policy                            |
| Config wiring    | `application.schema.json` `management` section exists but is marked `x-ndigo-read-from-config: false` (HI-5); options are constructor-only                                                 | a real `management.*` read path (or the annotation stays)       |
| Guard            | `scopedToManagementPaths(guard)` over the static path list (`management-auto-configuration.ts:156-168`)                                                                                    | computed path set from exposure                                 |

Demo wiring: `apps/04-ndigo-api` (the natural demo gate — already registers
`ManagementAutoConfiguration` + `ServerConfig`/`SecretsConfig` and runs the
inspect demo) and 13-ndigo-chat/14-ndigo-kanban/15-ndigo-resilience-lab.

## 3. Parity surface (Spring Boot 4.1 reference, `docs.spring.io/spring-boot/reference/actuator/endpoints.html`)

| Endpoint               | Spring shape / semantics (4.1)                                                                                                                                                                            | Ndigo mapping (this plan)                                                                                                                            |
| :--------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /health/{group}`  | group = a configured component subset; aggregate `{status, components}` with the same status rules; 404 unknown group                                                                                     | same; groups from config `management.health.groups.<group>.include`; group wins over a same-named component                                          |
| `GET /health/{name}`   | single component (optionally nested)                                                                                                                                                                      | single component result `{status, details}`; 404 unknown                                                                                             |
| `GET /loggers`         | `{levels, loggers: {name: {configuredLevel?, effectiveLevel}}, groups: {...}}`                                                                                                                            | `{levels, loggers: {name: {configuredLevel?, effectiveLevel}}}` (no groups in v1)                                                                    |
| `GET /loggers/{name}`  | `{configuredLevel?, effectiveLevel}`; 404 unknown                                                                                                                                                         | same                                                                                                                                                 |
| `POST /loggers/{name}` | body `{"configuredLevel":"debug"}`; `{}` clears; invalid level 400                                                                                                                                        | same (levels = ndigo's severity vocabulary, OTel `SeverityNumber`-derived)                                                                           |
| `GET /env`             | `{activeProfiles, propertySources: [{name, properties: {key: {value, origin}}}]}`; `?toMatch=` filter; **values sanitized by default** (`show-values` never / always / when-authorized; default `******`) | same; default `showValues: false`; origin at source granularity (flat-index `originOf` semantics)                                                    |
| `GET /configprops`     | collated `@ConfigurationProperties` entries, sanitized                                                                                                                                                    | declared keys + conversion types **only, never values** (framework contract — see §6 D-3)                                                            |
| Exposure               | `management.endpoints.web.exposure.include/exclude`; default **`health` only**; `*` = all; `management.endpoint.<id>.access` (read-only / none / default)                                                 | `management.endpoints.exposure.include` default `["health","metrics"]`; `*` supported; single `accessGuard` applies to every exposed management path |

Deliberate divergences (to ratify in AD-76): no `/actuator` prefix migration
(roots stay — existing deployments keep working); no per-endpoint
`access`/`max-permitted` ladder (the single-management-guard model stands);
`/metrics` parity rides GAP-5.

## 4. Change

### Wave 1 — Configuration substrate and exposure model

- **`ManagementProperties`** in `@ndigo/management`: reads the `management`
  subtree from the environment's property sources (deep-merged in precedence
  order — the config-file convention), validated by a zod schema
  (`endpoints.exposure.include` default `["health","metrics"]`,
  `endpoints.env.showValues`, `health.groups.<name>.include`). No
  `@ndigo/boot` dependency — the decorator lives in boot and no package pulls
  it at runtime (REU-9); the reader resolves at refresh, constructor options
  win over file values. (ADR-76 D-5 amendment.)
- **Exposure gating:** `handlerMappings()` registers the four controllers
  conditionally (`include`/`exclude`, `*` = all); `MANAGEMENT_PATHS` becomes a
  computed set from what is actually registered, so the guard covers exactly
  the served surface.
- Schema `management` section: split into the now-read keys (flip
  `x-ndigo-read-from-config` to a real read path — the HI-5 reachability spec
  gains the management keys) and the remaining constructor-only options
  (`redactHealthErrors`, `accessGuard`), which keep the annotation.
- **Acceptance:** exposure spec — default registers `/health`+`/metrics` only;
  `include: ["*"]` registers all five; `exclude` wins; guard hits a disabled
  endpoint's path only when it is registered. Config spec — a fixture
  property source with `management.endpoints.exposure.include` drives
  registration; reachability spec updated; `pnpm typecheck` (spec lane)
  green.

### Wave 2 — Health groups + single-component reads

- `HealthRegistry.check(names?: readonly string[]): Promise<HealthStatus>`
  — subset aggregation with the existing status rules; `checkAll()` = all names.
  No per-request mutation.
- `HealthController`: `GET /health/{name}` — configured group first (aggregate
  over the member subset; the aggregate document keeps `{status, components}`),
  else a registered component (single result, 404 when unknown). Group
  definitions read from `ManagementProperties.health.groups`.
- **Acceptance:** group aggregate flips DOWN when any member is DOWN;
  unknown group/component → 404; group shadows same-named component;
  `/health` unchanged. Fail-before/pass-after for each.

### Wave 3 — `/loggers` (write path)

- `@ndigo/log`: module-scope **per-name registry** — `LoggerFactory.setLevel(name, level)`
  (validated against the severity vocabulary), `clearLevel(name)`,
  `loggerNames(): readonly string[]` (tracked names of `getLogger` calls —
  names only, no handles held, so the no-registry-keeps-alive property holds),
  `effectiveLevel(name)`. `ConfigurableLogger` consults the per-name override
  before its handle-local one; both are runtime state (never persisted).
- `LoggersController` in `@ndigo/management` (`/loggers`): GET index, GET/POST
  per name; POST `{"configuredLevel": "…"}` sets, `{}` clears, unknown level
  400, unknown logger 404 (unknown name still accepts POST — optional create,
  matching Spring).
- **Acceptance:** set → new handles at that name reflect the level (revision
  bump included); clear → global threshold again; endpoint 400/404 cases;
  a POST to `/loggers` still requires the exposure to include `loggers`.
  Fail-before/pass-after.

### Wave 4 — `/configprops`

- `ConfigurationPropertiesController` (`/configprops`): enumerates
  `ManagementAutoConfigurationOptions.configurationClasses: Array<new () => unknown>`
  (the same explicit list `@ndigo/inspect` takes) through
  `declaredConfigurationProperties` → sorted `[{ prefix, key, type? }]`
  (schema-bound classes include `type` — REU-12 regression coverage). **Values
  are never read** — the endpoint cannot leak a secret by construction.
- **Acceptance:** declared keys + types for a schema-bound and a field-bound
  class; sorted/deduplicated; empty list → `{entries: []}`-style empty document,
  not an error. Fail-before/pass-after.

### Wave 5 — `/env`

- `EnvironmentController` (`/env`): walks `environment.getPropertySources().entries()`
  (precedence order) + `activeProfiles`; flattens each source's JSON tree to
  dotted keys; each entry `{ value?, origin }` where origin = source name.
  `?toMatch=` filters (Spring semantics: source-name contains the term, or key
  starts with the term). **Sanitization:** `management.endpoints.env.showValues`
  default `false` → every value is `"<redacted>"` (reuse the `REDACTED_VALUE`
  marker from `@ndigo/context`); with `true`, the **stored config text** is
  emitted — decrypted plaintext never surfaces (SEC-A invariant: `/env` shows
  what the operator put in the file, never what the cipher produced).
- **Acceptance:** multi-source precedence order; markers/ciphered values
  redacted under the default; `toMatch` filtering; decrypted plaintext absent
  under `showValues: true` with a live decryptor (throwaway probe). Fail-before/pass-after.

### Wave 6 — Demo, docs, gates

- `apps/04-ndigo-api`: expose `loggers`, `env`, `configprops` in its
  ManagementAutoConfiguration registration (explicit include list) +
  integration spec: GET each endpoint (shapes pinned), POST a level and read
  it back, group aggregate via a demo group, `?toMatch=`.
- Docs: new guide **26 — Management endpoints** (surface table, exposure,
  sanitization, guard posture — cross-ref AD-36/guide 11 §8); guide 03
  documented-keys table entries for `management.*` (read keys vs constructor
  options); docs/README guide range update; ARCHITECTURE package map
  (`ndigo-management` row) + roadmap GAP-4 flip; plans index entry once landed;
  CHANGELOG; generated API docs.
- Gates (full set of the review plan §9, incl. the spec-typecheck lane and
  `test:tooling`), plus a fresh-checkout archive run.

## 5. Deliberately out of scope

- `/metrics` parity (GAP-5, in parallel — the roadmap's own split; both touch
  `ManagementAutoConfiguration` registration, order-independent).
- `/actuator` prefix + hypermedia discovery page, `/entries`, `/mappings`,
  `/conditions`, `/scheduledtasks`, `/caches`, `/threaddump`, `/heapdump`,
  `/logfile` — no consumer before the four target endpoint types land.
- `POST`/`DELETE` environment overrides (conflicts with the config-file model;
  env mutation stays builder/CLI-owned), JMX, per-endpoint `access` ladder,
  CORS configuration.
- Persistence of level changes (process-local, documented — Spring parity).
- Logger groups (`groups` block in the loggers payload): revisit with a
  consumer.

## 6. Decisions to ratify (ADR-76)

1. **No `/actuator` prefix migration** — roots stay; exposure replaces
   presence as the control surface. Backward compatible.
2. **Default exposure `["health","metrics"]`** — existing behavior preserved,
   new endpoints opt-in; `*` supported. Tightens nothing, reveals nothing new
   without operator action.
3. **`/configprops` never emits values** — declared keys/types only; the
   framework contract that inspect established is the endpoint's contract.
   `/env` values default to redacted; `showValues: true` emits stored config
   text, never decrypted plaintext.
4. **Per-logger levels are runtime, process-local state** via a name-keyed
   registry in `@ndigo/log` (no handles retained); POST is registered only when
   `loggers` is exposed.
5. **`management.*` becomes a real read namespace** (ManagementProperties +
   schema flip + reachability spec) — reverses the HI-5 annotation for the
   new keys; legacy options stay constructor-only.
6. **Groups win over components on name collision**; group documents keep the
   ndigo `components` aggregate (Spring v3 shape) plus `timestamp` (existing
   ndigo extension).
7. **Guide 26 as the single management-endpoints reference**; guide 11 §8 and
   guide 03 tables updated to point at it.

## 7. Verification protocol

```bash
# Per wave: fail-before/pass-after specs, then:
pnpm --filter @ndigo/management test && pnpm --filter @ndigo/log test \
  && pnpm build && pnpm test && pnpm lint && pnpm format:check \
  && pnpm docs:links && pnpm manifest:check && pnpm typecheck \
  && pnpm test:tooling && pnpm doc && git diff --exit-code -- packages doc
# Fresh checkout: git archive HEAD | tar -x -C /tmp/x && pnpm install --frozen-lockfile
#   && pnpm build && pnpm test
# Live smoke (ndigo-api): curl /health, /health/<group>, /loggers, POST level,
#   /env?toMatch=, /configprops — shapes per §3
```

Acceptance for closure: every wave's fail-before/pass-after exists; the demo
spec pins all six routes; the full gate set is green on a fresh checkout;
`graft build` refreshed.

## 8. Execution log (2026-10-08)

All waves landed in this cycle, ADR-76 accepted; the full gate set (§7) is
green below with regenerated API docs.

- **Wave 1 — Configuration substrate and exposure model.** `ManagementProperties`
  (`managementSchema` + `readManagementSettings`: the deep-merged `management`
  source subtree, defaults for missing sections — no `@ndigo/boot` dependency,
  REU-9 layering) and `resolveExposure`/`isEndpointExposed`; the schema
  `management` section flipped from `x-ndigo-read-from-config: false` to the
  cited read path (reachability spec updated: `management.endpoints` +
  `management.health` move to `READ_FROM_CONFIG`; `NOT_READ_NAMESPACES` loses
  `management`; the BOOT-4 parity spec now compares only the annotated
  constructor-option keys). Exposure defaults to `["health","metrics"]`;
  options win over the file. Two container facts shaped the final shape:
  handler detection dispatches only the context-processed entry, so the three
  new controllers are decorator-registered (health/metrics pattern) with the
  gate enforced per request (`404` when unexposed — same wire behavior as no
  route); the absent-query binding is `null`, normalized before use.
- **Wave 2 — Health.** `HealthRegistry.check(names?)` (subset aggregation,
  identical status rules); `HealthController` gains `GET /health/:name`:
  configured group (shadows a same-named component; `404` when no member is
  registered) or a single component as a one-component aggregate.
- **Wave 3 — Loggers.** `@ndigo/log` gains the per-name registry
  (`LoggerFactory.setLevel`/`clearLevel`/`loggerNames`/`hasLogger`/
  `configuredLevel`/`effectiveLevel`; `reset()` clears the registry;
  overrides ride the revision machinery so pre-existing handles follow;
  override names join the enumeration) and the canonical threshold
  vocabulary (`LOGGER_LEVEL_NAMES` + strict `resolveLoggerLevel` /
  `loggerLevelName`). `LoggersController` serves the index, per-logger reads
  (`404` unknown), `POST {"configuredLevel": …}` / `{}` clears; invalid level
  names answer the dispatcher's `422` (documented divergence from Spring's
  `400`).
- **Wave 4 — Configprops.** `ConfigurationPropertiesController` enumerates
  the explicit `configurationClasses` option through
  `declaredConfigurationProperties` — keys + conversion types only (values
  never read, the inspect contract); entry names from the shared key prefix.
- **Wave 5 — Env.** `EnvironmentController` walks the sources in precedence
  order, flattens each document to dotted keys, redacts values by default
  (`showValues` opt-in emits raw stored text — never decrypted plaintext),
  origins = source names, `?toMatch=` filters.
- **Wave 6 — Demo, docs, gates.** `apps/04-ndigo-api` gains
  `ManagementConfiguration` (exposure `['*']`, `configurationClasses`
  `[ServerConfig, SecretsConfig]`) wired into `index.ts` + `inspect.ts`;
  the demo integration spec boots the real assembly and pins all five
  endpoints, the loggers write round-trip, redaction, and the
  key-types-only configprops document. Guide 26; guide 03 documented-keys
  table + annotation sentence; docs/README range (02–26); guides index;
  plans index; CHANGELOG (AD-76); ADR-76 + index.

### Final verification

`pnpm build` (incl. `@ndigo/log`, `@ndigo/management`, `@ndigo/boot`,
`@ndigo/api`) · `pnpm --filter @ndigo/management test` 47 tests · `ndigo-log`
21 · `@ndigo/boot` 182 · `@ndigo/api` 79 (incl. the new actuator demo suite) ·
`pnpm lint` 0 diagnostics · `pnpm format:check` · `pnpm typecheck` (build +
spec lane) · `pnpm docs:links` · `pnpm audit --prod` · `pnpm manifest:check`
· `pnpm doc` (regenerated API docs committed) · `graft build` refreshed.
