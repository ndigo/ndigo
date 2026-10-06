# Code Review and Mitigation — 2026-10-06 (Full-repository sweep)

**Date:** 2026-10-06
**Scope:** Whole repository at `5a7a9e20` (master, clean tree): all 42 packages
under `packages/`, 7 apps under `apps/`, `docs/` (including plans, decisions,
guides, reference), root tooling and CI, and repo hygiene. This is the first
full-repo review of the weekly series — previous waves reviewed only their
feature increments.
**Method:** 12 parallel read-only review slices (kernel/DI/boot, infra/test,
HTTP stack, platform/views, data, auth/security, ops/telemetry, protocol,
tooling/root, apps, docs, duplication/dead-code) run by review subagents, each
required to cite `file:line` evidence and label it `[code]` (read), `[exec]`
(probe), or `[inference]`. The integrator then re-verified headline claims
against the clean tree: `pnpm build` failure reproduced after `nx reset`;
dependency-cycle regression computed across `HEAD~1..HEAD~3`; `toRegExp`
crash, Drizzle DDL type mapping, and JWT exp/sub/short-secret acceptance
reproduced with `tsx` probes. Full gates were run before the review (§0).
**Status:** Findings recorded; **ALL WAVES EXECUTED AND VERIFIED
(2026-10-06)** — Waves 1–5 plus the close-out batch (HG-4 pnpm catalogs +
TypeScript normalization, HG-6 shared `delay`, SE-7..SE-12, HG-9/HG-10);
final gates and a live boot smoke are in §4 (Wave 6). Post-closure: SE-7's
user-wide revocation landed with AD-68 (`SessionStore.deleteForUser`,
`CredentialsAuthAdapter.logoutAll`, refresh-token `token_use` gate — see §4).
Still accepted: TO-14 (rule catalogue is complete but hand-maintained); a
`@vitest/coverage-v8` peer-drift follow-up; `pnpm audit --prod`'s single
remaining high advisory lives in the sibling todomvc checkout.
**Legend:** `[code]` established by reading cited lines · `[exec]` reproduced
by execution · `[inference]` reasoned without execution.
**Source IDs:** each finding keeps its slice-local origin where useful
(`CORE-*`, `INFRA-*`, `HTTP R-*`, `PLAT-*`, `DATA-*`, `SEC-*`, `OPS F-*`,
`PROTO-*`, `TOOL-*`, `APP F-*`, `DOCS-*`, `HYG-*`).

---

## 0. Gate baseline (run at `5a7a9e20`)

| Gate                  | Result                                                                    |
| :-------------------- | :------------------------------------------------------------------------ |
| `pnpm test`           | ✅ 42/42 projects green                                                   |
| `pnpm lint`           | ✅ zero warnings                                                          |
| `pnpm format:check`   | ✅ 1563 files                                                             |
| `pnpm manifest:check` | ✅ all packages conform                                                   |
| `pnpm docs:links`     | ✅ 223 files / 635 links                                                  |
| `pnpm agents:check`   | ✅ generated + repo-owned deployment files match                          |
| `pnpm doc:check`      | ✅ zero diff (generated API trees fresh)                                  |
| **`pnpm build`**      | ❌ **circular Nx task graph — see B-1; CI `Build libraries` cannot pass** |

**Process finding (P-1, Wave 1):** the previous wave's verification list
(tests, typecheck, doc:check, lint, graft) omitted `pnpm build`, which is the
first CI quality step (`.github/workflows/ci.yml:47`). Add `pnpm build` (and an
nx-graph acyclicity assertion) to the review checklist so a green test run can
no longer hide a broken task graph.

---

## 1. Findings

### 1.1 Block — build and CI

**B-1 (Block, Wave 1) — `pnpm build` fails: circular Nx task graph.**
`[exec]` `pnpm build` → `NX Could not execute command because the task graph
has a circular dependency: @blue/view-webcomponent:build:lib -->
@blue/context:build:lib --> @blue/content:build:lib --> @blue/factory:build:lib
--> @blue/telemetry:build:lib --> @blue/context:build:lib` (reproduced after
`pnpm exec nx reset`; CI runs the same command). Regression evidence: parsing
every workspace manifest at `HEAD~1..HEAD~3` yields **0 cycles**; HEAD yields
**5** — the docs commit added `"@blue/telemetry": "~0.0.1"` to
`packages/blue-factory/package.json` after wave-3 (`01671618`) added
`getLogger` imports at `packages/blue-factory/src/scope.ts:8,10` and
`abstract-factory.ts:38,40`. At `HEAD~1` the import existed without the
manifest entry (manifest gate would fail); at HEAD the manifest is declared and
the task graph is cyclic. **Fix (recommended):** extract the logger + severity
modules (`blue-telemetry/src/logger`, `.../severity` — both depend only on
`@opentelemetry/*`) into a leaf package (e.g. `@blue/log`, Layer 1), have
`@blue/telemetry` re-export them (including the existing
`@blue/telemetry/logger` subpath), and point `blue-factory` at the leaf — this
restores the layer direction, preserves the C-13 diagnostic routing intent, and
removes the factory→telemetry edge that closes the cycle. **Fallback (minimal
unblock):** delete the two unused instrumentation classes in
`packages/blue-telemetry/src/instrumentation/{context,dispatcher}` (see A-3)
and drop `@blue/context`, `@blue/dispatcher`, `@blue/router` from its manifest,
which also removes every cycle. Both fixes must be followed by
`pnpm build` + `pnpm manifest:check` + `nx graph` acyclicity verification.

### 1.2 Architecture and layering

**A-1 (Must Fix, Wave 1) — Package-level dependency cycles; the
"acyclic stack" claim is false.** `[exec]` Five minimal cycles exist in
runtime `dependencies` at HEAD (on top of B-1's task-graph failure):
`factory → telemetry → context → factory`; `factory → telemetry → router →
factory`; `factory → telemetry → router → http → factory`; `dispatcher →
content → factory → telemetry → dispatcher`; `content → factory → telemetry →
context → content`. Root cause: `@blue/telemetry` (Layer 4) imports
`@blue/context` and `@blue/dispatcher` (instrumentations) and `@blue/router`,
while Layer-2 `@blue/factory` imports `@blue/telemetry/logger`. The runtime
module graph is only cycle-free because factory imports the _logger subpath_;
any root-barrel import or moved file re-creates an ESM evaluation cycle. Fix
follows B-1 (leaf logger + prune instrumentation duplication); update
`ARCHITECTURE.md` (§1.3 A-2) and add an nx-graph/build gate to prevent
recurrence.

**A-2 (Should Fix, Wave 1) — `ARCHITECTURE.md` package map and verification
claims drift from the manifests.** `[code]` `factory` row
(`ARCHITECTURE.md:1079`) lists runtime deps `core, util` but the manifest and
source import `@blue/telemetry`; the map omits `@blue/proxy`,
`@blue/resilience`, `@blue/redis` and `@blue/openapi` rows; the section claims
"The stack is acyclic (verified via the Nx dependency graph)"
(`ARCHITECTURE.md:1067`) — false today (B-1/A-1) — and that the dependency
columns are "machine-verified by `scripts/check-manifests.mjs`"
(`ARCHITECTURE.md:1071`) — that script verifies src-imports ↔ manifest
declarations, not the table, and nothing validates ARCHITECTURE.md (verified:
no script references it). Fix: regenerate the map rows from manifests, correct
the verification wording, and add the missing packages (also DO-6).

**A-3 (Should Fix, Wave 1+4) — OTel instrumentation classes triplicated across
telemetry core/node/web; one revision stale, one file dead.** `[code]`
`CountedInstrumentation` exists at `blue-telemetry/src/instrumentation/counted.ts:21`
and again at `blue-telemetry-node/src/instrumentation/counted.ts:17` (the node
copy is imported nowhere and not exported — dead); `ContextInstrumentation` is
byte-identical in core/node/web (`.../context/context.ts:16` ×3, differing only
in base import and `@module`); `DispatcherInstrumentation` core
(`.../dispatcher/dispatcher.ts`) is a **stale revision** missing the
`_resolveViewName` wrap that node and web both carry. Fix: single
implementation + re-exports per B-1's chosen path; delete the dead node
`counted.ts`; add a parity/identity guard test.

**A-4 (Optional, Wave 5) — Content negotiation reads a process-global
`currentRequest`, unsafe under interleaved async dispatches.** `[code]`
`blue-view/src/content-negotiation-view-resolver.ts:26-33` module-level holder,
set/cleared around awaits in `blue-dispatcher/src/dispatcher.ts:205-209` and
`node-dispatcher.ts:91-97`; two concurrent requests can read each other's
`Accept`. Fix: thread the request through `resolveViewName`, or scope the
holder with an async-context store on Node and document the browser assumption.

### 1.3 Correctness — Must Fix

**CF-1 (CORE REV-001, Wave 2) — Conditional gates (`isActive`) bypassed for
`@configurationProperties` binding, refresh rebind, and `@environment` schema
collection.** `[code]` `blue-boot/src/application.ts:405` gates
`context.register(source)` but the auto-register loop (`:411-423`), the
`refreshScoped` filter (`:425-427`) and schema collection (`:471-474`) iterate
`#sources` ungated. `[exec]` an inactive `@whenBrowser @configurationProperties`
class still binds → boot throws `Missing required property "browseronly.token"`.
Fix: compute the active-source list once and use it for all four paths; add a
Node/bootstrap regression spec mirroring the probe.

**CF-2 (CORE REV-002, Wave 2; security) — Decrypted secret plaintext re-leaked
by the boot bind-error message.** `[exec]` with a wired cipher, a conversion
failure yields `Cannot bind DbConfig.password from "db.password" (value
"super-secret-hunter2"): ...` — the outer wrap at
`blue-boot/src/configuration-properties.ts:233-236` interpolates the decrypted
value although the resolver redacts (`property-resolver.ts:534-537`).
Contradicts guide 03's "decrypted values never reach error text or logs"
(guide-03:340) and is `[still-open from 2026-09-25 SEC-11]` (only resolver-side
text was fixed). Fix: drop the value from the message or mirror the resolver's
redaction; add a secrets-field-mode spec.

**CF-3 (CORE REV-003, Wave 2) — RefreshScope destruction callbacks are never
registered; refresh-scoped lifecycle beans never tear down.** `[code]`
`blue-factory/src/scope.ts:230-232,273-286` promises container-registered
destruction callbacks (AD-29 D-2); `registerDestructionCallback` is never wired
where values are created. Fix: register a `() => value.destroy()/close()`
callback in `AbstractFactory.getValue` when the scope exposes the hook and the
value passes `likeDestroyable`/`likeCloseable`; add a refresh-teardown spec.

**IN-1 (INFRA REV-001, Wave 2) — MockHTTP never finalizes interceptor denials:
auth/role-guard 401/403 silently become 200 with no body.** `[code]`
`blue-test/src/mock-http.ts:271-300` never calls `getInterceptorDenial(route)`
(the only consumer is the live adapter, `node-http-server-adapter.ts:999-1001`

- `#finalizeDenial`); `blue-auth-server/src/route-guard.ts:65` returns a bare
  denial; `apps/blue-api/src/secure-docs-configuration.ts:43-48` documents the
  gap and works around it. Fix: mirror the adapter's denial finalization in
  `MockHTTP` (shared helper), add 401/403/redirect tests, and document the
  contract.

**IN-2 (INFRA REV-002, Wave 2) — `toRegExp` misreads plain patterns containing
flag letters as flags and throws.** `[exec]` `toRegExp('my-pattern')`,
`toRegExp('input:checked')`, `toRegExp('greedy')` → `SyntaxError: Invalid flags
supplied to RegExp constructor`. `[code]` unanchored
`hasValidFlags = /[gimsuy]+/.test(value)` and an `extractFlags` fallback that
returns the whole input (`blue-util/src/string/to-reg-exp.ts:10,15,18,41,53`).
Fix: only accept flags from a matched `/.../ flags` shape with a strict
`^[gimsuy]*$` check; add regression cases.

**HT-1 (HTTP R-01, Wave 2; security, `[still-open residual from 2026-09-29
SEC-8]`) — CacheInterceptor stores and serves credentialed responses when
`Authorization` is attached by a request-time interceptor.** The write-path
gate reads `settings.headers` before the auth interceptor runs
(`blue-http/src/interceptors/cache-interceptor.ts:110-114`), while the read
gate checks the live request (`:72`); `blue-auth-client/src/auth-header-interceptor.ts:41-53`
attaches auth in `preRequest`. `[exec]` authenticated request cached, then
served to the logged-out session (server hits stay 1). Fix: record
credentialed/bypassed URLs in `preRequest` and consult them in `postResponse`
(or extend the response hook with the final `Request`); regression spec:
authenticated→unauthenticated pair makes two network calls.

**PL-1 (PLAT REV-001, Wave 3) — HashRouter public navigation never updates the
URL hash (documented contract violated).** `[exec]` jsdom probe:
`await router.setRoute('/foo')` / `navigate('/bar')` update in-memory route but
`location.hash` stays `#!/`. `[code]` `blue-platform-web/src/hash-router.ts:191-210`
only records history; `_restoreHash` (`:284-288`) compares `#/x` against `/x`
so it never detects "changed". Fix: write `location.hash` on successful public
`setRoute` (or correct the JSDoc to state-only), fix the compare, add
hash-sync + rollback specs.

**PL-2 (PLAT REV-002, Wave 3) — multipart `fileThreshold: 0` ("force disk for
every part") is silently ignored; parts buffer in memory.** `[code]`
`blue-platform-node/src/parse-multipart.ts:46-54` documents 0; `pickLimit`
(`:89-92`) coerces `<= 0` to the 128 KiB default, and `:426` gates spill on
`fileThreshold > 0`. `[exec]` 11-byte part with `fileThreshold: 0` leaves no
spill file; with `4` it spills. Fix: accept 0 (reject only negative/non-finite)
and spill when `size > threshold`; add a spill spec.

**PL-3 (PLAT REV-003, Wave 3) — FetchCredentialsInterceptor rebuilds the
Request from scratch: drops signal/mode/redirect/cache/integrity and throws on
bodied requests under undici.** `[code]`
`blue-platform-web/src/fetch-credentials.ts:51-59`; `[exec]` POST with body →
`TypeError: RequestInit: duplex option is required`; `new Request(request,
{credentials})` preserves everything. Also the JSDoc calls `'omit'` the fetch
default (it is `'same-origin'`). Fix: clone-with-init; add preservation +
bodied-POST specs; fix the doc.

**PL-4 (PLAT REV-004, Wave 3) — `Cookies.getJSON` throws on a missing key
instead of returning `undefined`.** `[exec]` `Cookies.getJSON('missing')` →
`SyntaxError: "undefined" is not valid JSON`; `[code]`
`blue-platform-web/src/cookies.ts:138-163` parses without an `undefined` guard.
Fix: return `undefined` for an absent jar entry; add a spec (and remove the
dead `isCookieParseSuccess` fallback branch).

**DA-1 (DATA, Wave 3) — `createTableStatements` maps almost every declared
column type to INTEGER and forces every primary key to INTEGER.** `[code]`
`blue-orm-drizzle/src/drizzle-data-source.ts:90-91`; `[exec]` re-verified here:
an entity with `varchar` title, `boolean` active, `json` payload and a string PK
produces `CREATE TABLE "notes" ("id" INTEGER PRIMARY KEY, "title" INTEGER NOT
NULL, "active" INTEGER NOT NULL, "payload" INTEGER NOT NULL)`. String PKs are
unpersistable (`SQLITE_MISMATCH`) and numeric-looking strings are silently
coerced; the package's own `drizzle-zod.ts:37-42` and
`blue-orm/src/entity-schema.ts:20-27` disagree with this mapping, and the
shipped `apps/blue-api` Drizzle demo hits it. Fix: one shared type-mapping
helper (int→INTEGER, real/float→REAL, blob→BLOB, char/varchar/text/string→TEXT;
AUTOINCREMENT only for generated int PKs); DDL-per-type + string-PK
round-trip specs.

**OP-1 (OPS F-1, Wave 3) — `CountedInstrumentation` binds counters to the
NoopMeter at `enable()` time; all `@counted` datapoints silently dropped.**
`[exec]` probe with real `sdk-metrics`: instrumentation constructed before
`setGlobalMeterProvider` never exports; a control counter does. `[code]`
`blue-telemetry/src/instrumentation/counted.ts:68-73` resolves the counter in
the shimmer wrapper factory invoked during `enable()` (constructor-driven);
`AbstractBaseInstrumentation._patchCount` (`base.ts:84-90`) is the correct
lazy pattern and is currently dead. Fix: lazy `counter ??=` on first call
(reuse `_patchCount`), both copies (or the surviving one per A-3); add an
export-assertion spec.

**OP-2 (OPS F-2, Wave 3) — `TaskScheduler` maxRunTime race leaves a ref'd,
untracked timer per run.** `[exec]` a run with `maxRunTimeMs: 2000` holds
process exit for the full 2 s after `close()`. `[code]`
`blue-scheduler/src/task-scheduler.ts:382-397` discards the `setTimeout`
handle, never clears it, never `unref()`s; `close()` tracks only `#timer`. Fix:
clear in `finally` (or unref); regression spec asserting prompt exit/teardown.

**PR-1 (PROTO SOCKET-1, Wave 3; security-adjacent) — `WebSocketClient.send()`
puts the whole Node Buffer pool slab on the wire for `Buffer` payloads.**
`[exec]` `send(Buffer.from('hello'))` delivered an 8192-byte ArrayBuffer
(view sharing the pool; `socket-client.ts:236-248` uses `.buffer` without
`byteOffset/byteLength`); a plain `Uint8Array` sends correctly. Leaks pooled
memory + corrupts frames; the client binary path has no tests. Fix: copy the
view (`data.buffer.slice(byteOffset, byteOffset+byteLength)`); byteLength specs
for Buffer/subarray/Uint8Array.

**PR-2 (PROTO OPENAPI-1, Wave 3) — Spec declares OpenAPI 3.0.3 but schemas are
converted with zod's default draft-2020-12 target.** `[exec]` nullable becomes
`type: ['string','null']`, literals `const`, tuples `prefixItems` — none valid
in 3.0.3; `{ target: 'openapi-3.0' }` produces `nullable`/`enum`/`items`.
`[code]` `blue-openapi/src/spec.ts:144-153` only strips `$schema`. Fix: pass the
OAS target and pin nullable/literal/tuple cases in a spec.

**TO-1 (TOOL PLUGIN-1+2, Wave 4) — Live AD-46 violation plus two rule holes.**
`[code]` `blue-auth-core/src/index.ts:16` re-exports `./_decorators` through the
barrel (consumed by `apps/blue-api/src/stomp-chat-controller.ts:25`), while
`no-internal-file-exports` only inspects `export *` and its own spec lists the
named form as valid (`blue-oxlint-plugin/test/rules/no-internal-file-exports.spec.ts:37`);
`no-internal-file-imports` misses `export * from '@blue/<pkg>/_internal'`.
Fix: promote `_decorators.ts` to a public file (AD-46 revisit trigger) or extend
both rules to named/all re-export visitors with spec updates.

**DO-1 (DOCS, Wave 4) — Package READMEs leak forbidden internal references.**
`[code]` `blue-proxy/README.md:13-14` and `blue-resilience/README.md:4,11-13`
carry AD/plan links; `blue-openapi/README.md:97` (AD-35) and
`blue-orm-drizzle/README.md:89` (AD-40) link decision records;
`blue-redis/README.md:209-220` embeds "Phase 2/3 verification observed…" logs —
all forbidden by the package-documentation standard (guide 12 §"No internal
references"). Fix: strip AD/plan references and verification logs; link guides
instead.

**DO-2 (DOCS, Wave 4) — Four package READMEs do not meet the README standard.**
`[exec]` `blue-proxy` (14 lines) and `blue-resilience` (13 lines) have zero
required sections; `blue-redis` uses six nonstandard H2s and no API link;
`blue-cache` misses Installation/Getting Started/Development/Contributing/
License. `scripts/check-manifests.mjs:101-104` only asserts existence + >200
chars, so CI cannot catch it. Fix: regenerate via the readme generator and
extend the manifest/docs gate to assert the mandatory H2 set.

### 1.4 Correctness and robustness — Should Fix

**CF-4 (CORE REV-004, W2) — Nested `@defaultValue` bypasses conversion.**
`[exec]` `@nested` field with `@defaultValue('5432')` binds `"5432"` (string)
while the identical top-level binds `number`. `[code]`
`configuration-properties.ts:462-467` skips `convertRaw` for the nested default
branch. Fix: convert; add nested number/boolean default specs.

**CF-5 (CORE REV-005, W2) — `init()` failures downgrade to a warning and the
half-initialized instance is still served.** `[exec]` probe: `getValue('boom')`
returns the instance after `init()` throws; `[code]` `_invokeInit`
(`abstract-factory.ts`) constructs a `FrameworkError` it never throws.
Fix: decide and pin the contract (prefer propagate like `_create`/`_configure`),
add a spec.

**CF-6 (CORE REV-006, W2) — A boot failure after context creation leaves the
context unclosed.** `[code]` `application.ts:105-127` can throw after
`_prepareContext` (validation `:469-486`, route scan) without
`context.close()`, leaking listeners/beans. Fix: close in the catch; spec
asserting `destroyed` + no refresh listener.

**CF-7 (CORE REV-007, W2, docs) — Guide 03 claims `.env` is auto-loaded (no
dotenv source exists) and its precedence chain omits the shipped
`configServer` slot.** `[code]` guide-03:40 vs AD-13 D3; §9 documents
`configServer` while §1 does not. Fix: land D3 or correct guide + AD status;
add the row/diagram entry.

**CF-8 (CORE REV-008, W2, docs) — `InitializationAwareProcessor` TSDoc has
before/after swapped** (`entry-processor.ts:13,20,22,29` — descriptions
inverted vs implementation). Fix: swap the two sentences.

**HT-2 (HTTP R-02, W2, perf) — `TimeoutInterceptor` timer map never clears:
keyed by its own signal, cleared by the Request's dependent signal.**
`[exec]` 3 completed requests leave 3 live Timeout resources and delay exit.
`[code]` `timeout-interceptor.ts:81` vs `:98,:107`. Fix: single-identity
keying (WeakMap on request) + delete on fire; resource-count regression.

**HT-3 (HTTP R-03, W2) — `TransformInterceptor` parses bodyless/empty bodies.**
`[exec]` HEAD/204 → bogus 418; empty POST → raw `SyntaxError` from
`preRequest`. `[code]` `transform-interceptor.ts:105-121` dispatches on
Content-Type only. Fix: guard `body === null`/empty/HEAD; route `preRequest`
failures through the documented completion hooks.

**HT-4 (HTTP R-04, W2) — Base-class-declared `@routeMapping`/`@errorMapping`
members are never discovered (subclassed controllers 404).** `[code]`
`route-mapping.ts:124-134` and `error-mapping.ts:46-56` upgrade enumerability
with a one-level `getOwnPropertyDescriptor`; the identical defect class was
fixed for `@entry` in blue-context (FOLLOW-1). Fix: prototype-chain walk (share
the fixed initializer); subclass resolution spec.

**HT-5 (HTTP R-05, W2) — `TimeoutInterceptor` overwrites `settings.signal`,
discarding the caller's AbortSignal.** `[code]` `timeout-interceptor.ts:76`;
`[exec]` a pre-aborted caller signal still reaches fetch. Fix:
`AbortSignal.any([...])` (fallback compose) and translate 408 only when the
timeout controller aborted.

**HT-6 (HTTP R-06, W2) — Dispatcher substitutes a `TypeError('view name is
undefined')` for unmapped handler errors.** `[code]` `dispatcher.ts:256-270`
throws; `:324-343` swallows the original error (no `cause`, no stack) and
resolves the dispatch. Fix: rethrow/wrap with `{ cause }`; spec on
completeHandle receiving the original error.

**IN-3 (INFRA REV-003, W4) — `@signal`/`@effect` declared in a subclass of a
`@reactive` class are silently inert; `getSignal` reports a misleading "missing
@reactive" error.** `[exec]` probe; `[code]`
`blue-signals/src/_decorators.ts:142-190` processes pending metadata once at
the end of `super(...)`, before subclass initializers run; the diagnostic
(`:26-46`) only knows the "forgot @reactive" cause. Fix: document the
limitation (README + JSDoc) and improve the error to list both causes (or
process metadata per-instance on first access).

**PL-5 (PLAT REV-005, W4) — BrowserRouter never runs postHandle/afterCompletion
and skips mapped-interceptor param binding.** `[code]`
`browser-router.ts:199-212` vs HashRouter's full phase sequence
(`hash-router.ts:255-283`). Fix: shared commit helper with all three phases +
`resolveRouteParams`; ordering specs.

**PL-6 (PLAT REV-006, W4) — Delegated events die permanently after
disconnect→reconnect in `AbstractWebComponent`.** `[exec]` jsdom probe;
`[code]` `abstract-web-component.ts:150-158` binds only when the delegation map
entry is created. Fix: re-bind in `connectedCallback`; regression spec.

**PL-7 (PLAT REV-007, W4) — Offline retry replay of a failed response degrades
to a bare GET (method/headers/body lost).** `[exec]` 503 POST with
Authorization + JSON body replayed as unauthenticated GET; `[code]`
`retry-on-offline-interceptor.ts:129-152` synthesizes a Request from response
headers. Fix: stash the original `Request.clone()` in `preRequest` (COR-7
pattern) and replay it; method/body/header spec.

**PL-8 (PLAT REV-008, W4, security-adjacent) — Socket-probe memo keyed by raw
request path grows unbounded.** `[code]` `node-http-server-adapter.ts:258,
492-497,946` memoizes every probed path including parameterized routes. Fix:
key by mapping identity, skip memo for parameterized routes, or bound with an
LRU; flood spec.

**DA-2 (DATA, W4) — Row→entity mapping ignores declared column types: booleans
read back as 0/1 (breaking load-modify-save) and JSON values as raw strings.**
`[exec]` probes; `[code]` `drizzle-entity-manager.ts:51-53` stringifies on
write, `:294-301` copies raw cells on read. Fix: decode per declared type
(mirror `baseSchemaForType`) or reject unsupported types at init; round-trip
specs incl. re-save.

**DA-3 (DATA, W4) — `InMemoryTransactionManager` rollback restores store
membership only; in-place entity mutations survive.** `[code]`
`blue-orm/src/data-source.ts:117-135` shallow-copies Maps; JSDoc calls it a
deep snapshot. Fix: deep-clone entities (re-point keys) or re-document as
membership rollback; in-place mutation spec.

**DA-4 (DATA, W4, docs) — `DrizzleDerivedQueryRepository` JSDoc documents
Spring prefix syntax (`findTop3ByPriority`) the parser rejects
(trailing-only).** `[code]` `drizzle-derived-query-repository.ts:15-27` vs
`derived-query-repository.ts:80-95`. Fix: correct the example to
`findByPriorityTop3`; pin it with a spec.

**OP-3 (OPS F-3, W4) — Web RouterInstrumentation patches async `_setRoute`
with `_patchSync`.** `[code]` `blue-telemetry-web/src/instrumentation/router/router.ts:22,32-41`
vs `base.ts:115-135` — spans end before the async work; failures never flagged.
Fix: promise-aware `_patch` or settled-wrapper; deferred/failing spec.

**OP-4 (OPS F-4, W4) — `/metrics` omits duration summaries its JSDoc promises
while still computing them.** `[code]` `metrics-controller.ts:17,48-57`.
Fix: include `durations` or project them out; pin the response shape.

**OP-5 (OPS F-5, W4) — Inbound HTTP spans always finish OK and carry no
response status.** `[code]` request patch sets `{ok:true}` for every resolved
request though the adapter converts failures to problem responses
(`node-http-server-adapter.ts:995-1011`). Fix: read `res.statusCode` on
settle; map 5xx→ERROR; spec with a throwing route.

**OP-6 (OPS F-7, W4) — Browser `_wrap` is non-idempotent but most
instrumentations lack an enable latch.** `[code]` browser `InstrumentationBase`
runs `enable()` from the constructor; `disable()` leaves wrappers live. Fix:
latch in `AbstractBaseInstrumentation`; re-enable/disable spec.

**OP-7 (OPS F-8, W4) — `CircuitBreakerSpec` values unvalidated
(`failureThreshold: 0/NaN`, `resetMs <= 0` silently invert/disable).**
`[code]` `resilience/src/circuit-breaker.ts:101-102,114,135`. Fix: validate at
weave/invoke time (fail loud like `validateRetrySpec`); spec 0/NaN/negative.

**OP-8 (OPS F-9, W4) — Node log export is inert by default: `configureTelemetry`
never switches `LoggerFactory` type.** `[code]`
`logger-factory.ts:51` defaults to console; only browser config switches.
Fix: switch when `logExporter` is configured (web parity) or document the
required step; spec.

**OP-9 (OPS F-10, W4, docs) — No OTel shutdown/flush integration or docs;
batched telemetry is dropped on exit.** `[code]` `configureTelemetry` returns
the NodeSDK, nothing calls `shutdown()`; the demo discards it
(`apps/blue-api/src/index.ts:32-38,95`). Fix: document `sdk.shutdown()` and
wire it into graceful shutdown; smoke test.

**OP-10 (OPS F-11, W4) — `fatal`/`critical` severity map to INFO; severe logs
silently filtered.** `[exec]` probe `levelToSeverityNumber('fatal') → 9` vs
`SeverityNumber.FATAL = 21`. Fix: add the names to the scheme tables (they map
`emerg`/`alert`), spec; consider fail-loud for unknown levels.

**SE-1 (SEC AUD-SEC-1, W4) — JWT verification does not require `exp` or
`sub`.** `[exec]` re-verified here: exp-less token (`sub: victim`, `roles:
admin`) validates to a principal; sub-less token becomes `id: 'unknown'`.
`[code]` `jwt-adapter.ts:182-217` options lack `requiredClaims`; JSDoc claims
expiration is validated; `principalFromPayload` (`:431-437`) defaults
`'unknown'`. Fix: `requiredClaims: ['exp','sub']`, optional `clockTolerance`,
reject non-string `sub`; regression specs.

**SE-2 (SEC AUD-SEC-2, W4) — JWTAdapter accepts arbitrarily short HMAC
secrets.** `[exec]` re-verified: 1-byte secret accepted at construction and
usable. `[code]` `jwt-adapter.ts:135-140,345-352`; contrast AES-GCM's exact-32
check (`aes-gcm-cipher.ts:106-118`). Fix: require ≥32 bytes for HS*; constructor
spec.

**SE-3 (SEC AUD-SEC-3 + OPS F-12, W4, docs) — Management-gating recipes
(`blue-management/README.md:29,66`, guide 11 §8) recommend `AuthRouteGuard`,
which is inert for metadata-less `/health`+`/metrics` handlers.** `[code]`
`management-auto-configuration.ts:127-141`, `route-guard.ts:90-9x`; guide 13 §1
and the option JSDoc already carry the correct unconditional-guard wording.
Fix: align guide 11 + README; optionally reject metadata-driven guards at
wiring time; spec that `/health` stays anonymous unless an unconditional guard
is configured.

**SE-4 (SEC AUD-SEC-4, W4) — `/health` and `/metrics` are served without the
default security-header set.** `[code]` management mapping pushes only the
optional access guard (`management-auto-configuration.ts:113-117`) vs the docs
mapping's `SecurityHeadersInterceptor`
(`openapi-docs-auto-configuration.ts:190-194`). Fix: unshift
`SecurityHeadersInterceptor`; header spec.

**SE-5 (SEC AUD-SEC-5, W4) — OIDC authorization-code flow cannot survive the
redirect it initiates: pending `state`/`nonce`/PKCE verifier live only in a
per-instance Map.** `[code]` `oidc-adapter.ts:233,448-479`; no API re-injects
persisted copies. Fix: state-store seam or caller-persisted pending state;
document instance affinity; two-instance spec.

**SE-6 (SEC AUD-SEC-6, W4, docs) — Both auth READMEs document guard APIs that
do not exist** (`blue-auth-client/README.md:54-60` vs
`client-guard.ts:62,74`; `blue-auth-server/README.md:5x`). Fix: rewrite from
real signatures; consider a doc-snippet check.

**TO-2 (TOOL GEN-1, W4) — `@blue/generators` is the only package without
`build:lib` while its manifest and the manifest gate require `lib/`.** `[exec]`
`nx show project @blue/generators` lists only test targets; `files` includes
`lib`; `check-manifests.mjs:115-119` enforces it with an explicit "no
exemption" comment. Fix: add `"build:lib": "tsc -b tsconfig.build.json"`.

**TO-3 (TOOL ROOT-1, W4) — `nx.json`'s legacy `projects` map is inert;
`pnpm build:todomvc` fails 100%; nx cache inputs omit the shared build
tsconfig.** `[exec]` `nx show project @blue/todomvc` → not found; all app
targets are inferred scripts. Fix: delete the ignored blocks, rewrite
`build:todomvc` to the working filter form, add
`{workspaceRoot}/tsconfig.build.json` to `namedInputs.sharedGlobals`, document
the sibling-checkout requirement.

**TO-4 (TOOL GEN-2, W4) — Package scaffold always fails `pnpm manifest:check`
(template omits `keywords`; default description is gate-rejected).**
`[code]` `package.json.template:1-33`, `generators/package/generator.ts` vs
`check-manifests.mjs:107,111`. Fix: add keywords + a conforming description
rule; extend the generator spec to run the manifest rules.

**TO-5 (TOOL GEN-3, W4, naming) — Generated package headers use `@module
<name>` while the repo, the component template, and the header-repair generator
use `blue-<name>`.** `[code]` `src/index.ts.template:4` vs
`component/.../__fileName__.ts.template:4`, `header/generator.ts:68-72`. Fix:
template + spec.

**TO-6 (TOOL SCRIPT-1, W4, dead-code) — Dead one-shot migration script is
broken under ESM and would strip the now-mandatory `@module` tags if repaired;
docs still tell contributors to run it.** `[exec]` `require` in ESM;
`[code]` `scripts/migrate-jsdoc-to-tsdoc.js:28-31` deletes `@module` lines; 6 of
19 targets no longer exist; `docs/migrations/2026-01-27_DOCS.md:94,536` still
instruct it. Fix: delete the script and annotate the migration doc.

**TO-7 (TOOL DOCS-1, W4, docs) — Guide 12's `files` row contradicts the
manifest gate it is the standard for** (guide-12:71 vs
`check-manifests.mjs:115-119`). Fix: state the enforced contract.

**DO-3 (DOCS, W5) — `docs/plans/README.md` index drift: 28/111 plan files
unindexed, stale `AD-01..AD-65` range (AD-66 exists), stray duplicated block
above the intro.** `[exec]` list in the slice report. Fix: dedupe header, bump
range, classify the missing files.

**DO-4 (DOCS, W5) — `docs/migrations/README.md` misses 5/13 files; one file
violates the dated naming convention.** Fix: index the missing entries; rename
or archive `Wave_3_Content_Negotiation_and_Template_View_Contract.md`.

**DO-5 (DOCS, W5) — CSP hardening (SEC-4) contradicted by three living docs**
(AD-25 D-3 `connect-src 'self' ws: wss:`, security.md:71-74, gap analysis:74).
Fix: amend AD-25 with a superseded-by-SEC-4 note; correct both docs.

**DO-6 (DOCS, W5) — Root README package list and ARCHITECTURE Package Map omit
recently shipped packages; AD range + Nx version stale.** `[exec]` README
omits `@blue/proxy`, `@blue/redis`, `@blue/resilience`; map omits `@blue/openapi`
etc. Fix (with A-2): regenerate both inventories from the manifests.

**DO-7 (DOCS, W5) — Repo-wide docs describe removed tooling/facts (Prettier
config, ramda import rule, `api-report` script, Node ≥18).** Fix: sweep
STYLE_GUIDE/AGENTS/CONTRIBUTING to oxfmt/`.oxfmtrc.json`, Node ≥22, current
integration-layer examples.

**DO-8 (DOCS, W5) — Unarchived "current" reference docs cite wrong or
nonexistent code** (router reference: HashRouter attribution,
`GlobPathMatcher` name, resolveParams signature; security map encryption cell).
Fix: correct or mark ARCHIVED.

**DO-9 (DOCS, W5) — Feature-doc coverage gaps: static files (AD-28), env
accessors, resolver utils, signals have no how-to docs.** Fix: add
static-files coverage + the two exports' docs; create/fold a signals section.

**AP-1 (APP F-1, W4) — blue-todo `signals-counter` can never render: shadow
root never attached.** `[code]` `apps/blue-todo/src/signals-counter-view.ts:10-21,35-43,50-59`
reads `shadowRoot` which nothing attaches (`attachShadow` appears nowhere in
packages/apps). Fix: attach shadow (or render light-DOM); component spec.

**AP-2 (APP F-2, W4) — blue-host navigation anchors are inert (`data-route`
has no handler anywhere).** `[code]` `apps/blue-host/index.html:34-37`,
`src/index.ts:18-26`. Fix: `href="#/catalog"` (repo convention) or a delegated
click listener; mapping test.

**AP-3 (APP F-3, W4) — blue-views `/report` cannot load in a production build:
`@vite-ignore` keeps the `.ts` specifier unbundled.** `[exec]` bundle contains
`./views/report-view.ts` and no emitted chunk. `[code]`
`report-view-resolver.ts:12,16-18,31-38`. Fix: statically analyzable
`import()` or `import.meta.glob`; verify via build+preview.

**AP-4 (APP F-5, W4, docs) — blue-island's documented run flow is broken
(`pnpm dev` does not exist; `start` serves an unbuilt client).** Fix: add a
`dev` script or point docs at `start:full`.

**HG-3 (HYG, W4) — Error-message extraction reinvented at 11+ sites;
`getErrorMessage` is not shared.** `[code]`
`blue-factory/src/factory-contract.ts:71-73` + 11 inline copies listed in the
slice report. Fix: promote to `@blue/util`; migrate call sites.

**HG-4 (HYG, W4) — Dependency duplication across manifests, no pnpm catalog,
TypeScript major skew.** `[code]` zod in 12 manifests,
`@tsmetadata/polyfill` in ~15, `@opentelemetry/api` in 6,
`pnpm-workspace.yaml` has overrides but no `catalog:`; root TypeScript `~7.0.2`
vs packages `^6.0.3`/`~6.0.3`. Fix: introduce catalogs; normalize the
TypeScript range; decide `workspace:*` for internal pins.

**HG-5 (HYG, W4) — Five stale one-off doc-migration scripts + JSON blobs in
`packages/blue-util/scripts/`** target directories that no longer exist and are
referenced by nothing. Fix: delete (or archive) with TO-6.

### 1.5 Optional, Nit and FYI findings

**Optional**

| ID                             | Finding                                                                                                                                                                    | Fix                                                                                   |
| :----------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ |
| CF-9 (CORE REV-009)            | `@property` fields silently unbound without `@propertySource`; `ConfigurationParser` memoized against a stale environment (`configuration.ts:370-374`). `[exec]`           | Lift the gate or warn; recreate parser on environment change; spec.                   |
| CF-10 (CORE REV-010)           | Exported lifecycle/registry contracts lack TSDoc (`lifecycle.ts:9-45,101`, `registry.ts:9`); factory README omits `refresh`.                                               | Add one-line blocks; README row.                                                      |
| IN-8 (INFRA REV-008)           | `interceptMethods` throws an unhelpful TypeError for arrow/bound targets (`weave.ts:60-62`). `[exec]`                                                                      | Guard/describe; or pass through with `[]`.                                            |
| IN-9 (INFRA REV-009)           | Processor's already-intercepted guard misattributes standalone-woven instances and blocks registration with a misleading message. `[exec]`                                 | Provenance marker or reworded error.                                                  |
| IN-10 (INFRA REV-010)          | Test "stops reacting after dispose" never disposes (duplicate case, `decorators.spec.ts:174-190`).                                                                         | Delete or fix to assert post-dispose silence.                                         |
| HT-7 (HTTP R-07)               | Empty-value expressions decided by truthiness; repeated-key values never match (`route-condition.ts:120`). `[exec]`                                                        | Branch on `!== undefined`; define array semantics; specs.                             |
| HT-8 (HTTP R-08)               | Dead mapping-name APIs and write-only adapter state (`_mapping-registry.ts:93`, `abstract-handler-method-mapping.ts:145-147`).                                             | Wire or delete (`getHandlerMethodsForMappingName`, `namingStrategy`, `#nameLookup`).  |
| HT-9 (HTTP R-10)               | `blue-view` reads raw `accept` record key although `@blue/http`'s folding helper is a declared dep (`content-negotiation-view-resolver.ts:379`).                           | Use `HTTPHeaders.ACCEPT.get`.                                                         |
| HT-10 (HTTP R-11)              | `PartitionRouter.unmount` removes every mount sharing a prefix; unregister can unmount a sibling.                                                                          | Reject duplicate prefixes or key mounts by owner; spec.                               |
| PL-9 (PLAT REV-009)            | `writeRenderResult` ignores response backpressure for streamed bodies (`producer-writer.ts:41-52`; contrast `static-resource-handler.ts:397-403`).                         | Await `drain`; slow-consumer spec.                                                    |
| PL-10 (PLAT REV-010)           | Formatting service can silently fall back to ambient locale while typed as explicit (`formatter.ts:424-433`).                                                              | Fail loud or type/document honestly; spec.                                            |
| PL-11 (PLAT REV-011)           | `HTTPResponseViewTarget` re-implements entity serialization with divergent 4xx semantics (`node-view-target.ts:42-62`).                                                    | Delegate to `ResponseEntityView`; 4xx fragment spec.                                  |
| PL-12 (PLAT REV-012)           | `OfflineInterceptor` has no teardown (window listeners + heartbeat interval live for page lifetime).                                                                       | Add idempotent `dispose()`; teardown spec.                                            |
| DA-5 (DATA)                    | `blue-orm` README uses `@Entity` though the export is `@entity` (both snippets do not compile).                                                                            | Fix snippets; consider a snippet check.                                               |
| DA-6 (DATA)                    | Caching guide passes two generics to `Cache<V>` (declares one) — snippet cannot compile (guide-07:90).                                                                     | Fix snippet; sweep guide snippets.                                                    |
| DA-7 (DATA)                    | `count()`/`existsById()` materialize every row; `deleteById()` does find-then-delete (`drizzle-repository.ts:122-141`; `findPage` already shows SQL COUNT).                | Use COUNT/EXISTS/direct DELETE.                                                       |
| DA-8 (DATA)                    | `RedisSocketFanout.lastError` precedence can permanently mask malformed-envelope errors (`socket-fanout.ts:53-54`).                                                        | Track latest of all sources or document precedence; test.                             |
| DA-9 (DATA)                    | Token→cache-name resolution duplicated across memory/Redis managers and `@cached` with three validations.                                                                  | Shared `resolveCacheName` helper.                                                     |
| SE-7 (SEC AUD-SEC-7)           | Disabling an account does not revoke live sessions/JWTs; no user-wide revocation API (`credentials-auth-adapter.ts:112-114`, `jwt-adapter.ts:194-200`).                    | Consume `disabled` during validation; add session/user revocation; ADR.               |
| SE-8 (SEC AUD-SEC-8)           | CSRF double-submit has no server-side binding or `__Host-` prefix; cookie tossing from a sibling subdomain defeats it (`csrf-interceptor.ts:67,104-117`).                  | Sign the token or use `__Host-`; document trust assumption.                           |
| SE-9 (SEC AUD-DEP-1)           | `pnpm audit --prod`: 1 high + 2 moderate, all on sibling-demo/build chains; `smol-toml` override floor too low; `nx` unpinned.                                             | Bump overrides (`smol-toml >=1.8.1`, `nx >=23.2.1`); re-audit.                        |
| SE-10 (SEC AUD-SEC-9)          | Remote config source has no fetch timeout or response-size cap (asymmetric with OIDC hardening) (`remote-property-source.ts:279,299`).                                     | Mirror OIDC options (`fetchTimeoutMs`, `maxResponseBytes`).                           |
| SE-11 (SEC AUD-SEC-10)         | Cookie writer strips `;`-injections only when preceded by a space (`cookies.ts:120-132`).                                                                                  | Split on `/;/`, reject CRLF/`;` in names; spec.                                       |
| OP-12 (OPS F-13)               | Telemetry doc drift: non-compiling browser example; wrong `LoggerFactory` setter/attribute names.                                                                          | Fix snippets/names; regenerate docs.                                                  |
| OP-13 (OPS F-14)               | `TaskScheduler.start()` timer chain effectively untested (no wall-clock loop, re-arm, or stop test).                                                                       | Short-timer specs.                                                                    |
| OP-14 (OPS F-15)               | Browser OTLP trace export uses `SimpleSpanProcessor` — one HTTP request per span.                                                                                          | Use `BatchSpanProcessor` for OTLP; assert processor type.                             |
| PR-8 (PROTO SERVICE-4)         | `streamCall` span ends UNSET (no exception) for request-level failures (`service-client.ts:91-96`).                                                                        | Mark ERROR around the whole body; spec.                                               |
| PR-9 (PROTO OPENAPI-2)         | Recursive DTOs embed root-relative `$ref: '#'` under paths. `[exec]`                                                                                                       | Hoist to `components.schemas` or document limitation; spec.                           |
| PR-10 (PROTO SOCKET-2)         | `InMemoryQueueMessageStore` derives ring capacity from byte budget → silent early eviction for empty bodies. `[exec]`                                                      | Reserve count bound or charge `max(1, octets)`; spec.                                 |
| PR-11 (PROTO OPENAPI-3)        | Path template variables without a declared extractor produce spec-invalid operations.                                                                                      | Synthesize missing path parameters; spec.                                             |
| PR-12 (PROTO OPENAPI-4)        | Multipart request-body generation has zero test coverage.                                                                                                                  | Fixture with `fileValue`+`requestPart`; assert schema.                                |
| TO-8 (TOOL PLUGIN-3)           | Plugin README table omits two registered error-level rules.                                                                                                                | Add rows (or generate the table).                                                     |
| TO-9 (TOOL SCRIPT-2)           | Benchmark scripts hardcode content-hashed sibling bundles; `test:benchmark` leaks a preview server and races `sleep 5`.                                                    | Glob newest bundle; port-wait + trap.                                                 |
| TO-10 (TOOL ROOT-2)            | `pnpm lint` depends on gitignored plugin `lib/` (fails fresh; stale after rule edits).                                                                                     | Build-first wrapper or document prerequisite.                                         |
| TO-11 (TOOL ROOT-3)            | Four unreferenced root devDeps; root manifest exempt from dead-dep checks.                                                                                                 | Remove; extend the checker to root.                                                   |
| TO-12 (TOOL ROOT-4)            | Dead `vite.config.lib.ts` (imports uninstalled `vite-plugin-dts`) + stale ignore entries for deleted packages/test worker.                                                 | Delete; update STYLE_GUIDE example; prune ignores.                                    |
| TO-13 (TOOL GATES-1 + APP F-4) | 4 of 7 apps are never type-checked (no `tsconfig.build.json`; blue-host has none, blue-views' fails); link gate skips all package/app READMEs; no root `typecheck` script. | Add per-app tsconfigs + CI filter; expose `typecheck`; widen the link gate; document. |
| AP-5 (APP F-6)                 | blue-views README describes a different app (content negotiation/CSV) than shipped (module-on-disk).                                                                       | Rewrite to the three actual view locations.                                           |
| AP-6 (APP F-7)                 | App READMEs misstate auth mechanisms ("JWT auth" vs opaque sessions; `@blue/auth-core` vs `auth-client`).                                                                  | Correct both.                                                                         |
| AP-7 (APP F-8)                 | 19 unused `@blue/*` deps across apps; manifest:check does not scan apps.                                                                                                   | Remove deps; extend the scanner to apps.                                              |
| AP-8 (APP F-9)                 | blue-todo exports `lookupPrincipal` and `authMiddleware` with zero callers.                                                                                                | Delete or use.                                                                        |
| AP-9 (APP F-10)                | blue-api README omits three live routes; matrix demo untested; stale `@defaultValue` comment.                                                                              | Add routes; matrix test; comment fix.                                                 |
| HG-6                           | `delay(ms)` test helper copy-pasted across 6-8 specs; `@blue/test` is the natural home.                                                                                    | Export `delay`/`flushMicrotasks`; migrate.                                            |
| HG-7                           | Platform argument-resolver boilerplate duplicated node vs web (whole-source binder, whole-jar cookie case, configure tails).                                               | Hoist into `AbstractPlatformArgumentResolver`.                                        |
| HG-8                           | Crypto-random hex filename recipe inlined twice; `randHex` is weak-PRNG.                                                                                                   | Add crypto `randomHex` to `@blue/util`; use at both sites.                            |
| HG-12                          | Tracked junk: 11+ `.DS_Store` files (apps+packages), `blue-util/bench/like.bench.ts.backup` + `.summary.md`, authoring JSON blobs. `[still-open from 2026-09-29 HYG-1]`    | `git rm --cached`; `.gitignore`; delete backups.                                      |

**Nit / FYI**

| ID                    | Finding                                                                                                                                                       | Fix                                                      |
| :-------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------- |
| CF-11 (CORE REV-011)  | Commented-out processor block (~55 lines), identical if/else arms, empty else-if, `* *` doc lines (`entry-processor.ts:166-222`, `configuration.ts:432-439`). | Delete/collapse mechanically.                            |
| HT-11 (HTTP R-12)     | `RouteHandlerMethod.invoke` throws a TypeError while building the undeclared-argument error (`parameters.ts:170-186`). `[exec]`                               | Reject sparse maps at registration or guard the builder. |
| DA-10 (DATA)          | `MemoryCache.size()` may count expired entries while guide-07:29 says "live entries" (Redis counts live).                                                     | Reword guide or sweep in `size()`.                       |
| DA-11 (DATA)          | `@cached` throws on an undefined receiver unlike its `@transactional` mirror.                                                                                 | `?.` + detached-call spec, or document.                  |
| DA-12 (DATA)          | Migrator comments/AD-30 D-2 justify no-transaction with a non-reproducing reason; real constraint is `batch()`'s implicit transaction. `[exec]`               | Correct comments + AD-30 note.                           |
| SE-12 (SEC AUD-DOC-1) | `NodeRequest.session` JSDoc says the bag is always empty, contradicting the shipped `NodeSessionInterceptor`.                                                 | Update JSDoc + cross-reference.                          |
| TO-14 (TOOL PLUGIN-4) | Rule documentation only in the README table; generated `doc/api` shows a single `default` export.                                                             | Optional: generate the rule table from metadata.         |
| AP-10 (APP F-11)      | `.DS_Store` still tracked — see HG-12.                                                                                                                        | —                                                        |
| AP-11 (APP F-12)      | blue-todo `todo-item` getter contradicts its setter (`get checked()` reads the attribute; setter stores `#checked`).                                          | Back getter with `#checked`; round-trip spec.            |
| IN-12 (INFRA REV-012) | Malformed `* * @module` JSDoc tags in 10 files (blue-util/blue-test/blue-signals).                                                                            | Normalize; re-run doc:check.                             |
| HG-9                  | Env integer parsing duplicated across platform-node resolvers (three variants, drift-prone).                                                                  | Extract `readIntEnv`.                                    |
| HG-10                 | Test mock re-derives header lower-casing instead of the canonical folding model.                                                                              | Share the normaliser or cross-reference.                 |
| HG-11                 | ~8 `@blue/util` exports have zero production consumers (decodeHtml/encodeHtml/trailingSplit/toProper/randHex/randInt/isValidDate/isNumeric).                  | Confirm as public API surface or prune in an API pass.   |

---

## 2. Verified good (no action)

- **Prior-wave remediations hold** in every slice that re-checked them: 2026-10-04
  C-1..C-5/D-1 (blue-proxy), S-1..S-3/H-4 (redis/LibSQL/cache), the 09-25/27/28/29
  fixes across dispatcher/router/http (COR-2/3/4/5/6/7/9/10/11/17, SEC-6/SEC-9,
  MTC-1), and the security series (fixation-safe sessions, scrypt caps,
  explicit-algorithm JWT, AES-GCM AAD, trusted-proxy, CORS/static fail-closed).
  No previously fixed item was found re-broken; the new defects are in
  areas/branches prior waves did not touch.
- **Security posture is strong where it counts:** parameterized SQL with
  constant identifiers, versioned Redis envelopes, `realpath`+prefix
  containment on static files, no `Math.random` for tokens, redacted health
  errors, deny-by-default trusted proxy, no committed secrets.
- **CI wiring is broad and fail-loud** (install-frozen → build → test →
  lint → format → links → audit → manifest → agents → tsc → typedoc freshness
  → graft), actions SHA-pinned, least-privilege token.
- **Test suites are dense and honest** (42/42 projects; real-backend LibSQL
  tests; redis live tests gated by env; per-run scheduler semantics; header
  folding; radix routing).
- **Generated API docs are fresh** (`pnpm doc:check` diff-free) and the
  manifest/agents gates are green.
- **Integration-layer discipline holds** (no direct `seedrandom`/`slug`/
  `linkedom` imports outside the wrappers; ramda removed), and the oxlint
  plugin has per-rule specs with conservative matching.

---

## 3. Waves

| Wave                            | Content                                                                                                                                                                                                                                                                                                         | Items                                                         |
| :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------ |
| 1 — Build unblock + truth-up    | Fix B-1 (leaf logger **or** prune unused telemetry-core instrumentations + manifest), verify `pnpm build` + nx acyclicity; A-1 cycle elimination; A-2/DO-6 ARCHITECTURE + README inventories; A-3 instrumentation consolidation decision; P-1 review-gate addition (`pnpm build` + cycle check)                 | B-1 A-1 A-2 A-3 P-1                                           |
| 2 — Must-Fix correctness (core) | Conditional-gate bypass, secret re-leak, refresh-scope teardown, MockHTTP denials, toRegExp, cache credential leak                                                                                                                                                                                              | CF-1 CF-2 CF-3 IN-1 IN-2 HT-1                                 |
| 3 — Must-Fix correctness (rest) | HashRouter hash, multipart threshold, FetchCredentials, Cookies.getJSON, DDL type mapping, counted NoopMeter, scheduler timer, socket Buffer slab, OpenAPI target                                                                                                                                               | PL-1 PL-2 PL-3 PL-4 DA-1 OP-1 OP-2 PR-1 PR-2                  |
| 4 — Standards, security, reuse  | AD-46 + rules; package README standard/leaks; JWT hardening; management headers/gating docs; OIDC state; SHOULD-fix correctness cluster (CF-4..CF-8, HT-2..HT-6, IN-3, PL-5..PL-8, DA-2..DA-4, OP-3..OP-10, TO-2..TO-7, AP-1..AP-4, HG-3..HG-5)                                                                 | TO-1 DO-1 DO-2 SE-1..SE-6 + all Wave-4 Should-Fix items       |
| 5 — Hygiene/docs sweep          | Index repairs, doc sweeps, dead code/files, catalogs, gates widening, remaining Optional/Nit items                                                                                                                                                                                                              | DO-3..DO-9, TO-8..TO-13, AP-5..AP-9, HG-6..HG-12, table items |
| 6 — Verification                | Per-wave regression tests (listed with each item); then full gates: `pnpm build`, `pnpm test`, typecheck lane, `pnpm lint`, `pnpm format:check`, `pnpm manifest:check`, `pnpm doc:check`, `pnpm docs:links`, `pnpm agents:check`, `pnpm audit --prod`, `graft build && graft check`; commit per repo convention | —                                                             |

**Decision needed before Wave 1:** logger placement (new `@blue/log` leaf vs
pruning telemetry-core instrumentations). Recommendation: the leaf — it keeps
C-13's shared-diagnostics intent, respects the documented layering, and fixes
A-3 at the same time; the prune is the fallback if the leaf extraction is
deferred. Either way an ADR amendment (or new AD) should record the telemetry
layering contract.

---

## 4. Verification

- **B-1:** `pnpm exec nx reset && pnpm build` exits 0; `nx show projects` +
  a task-graph run show no cycle; `pnpm manifest:check` stays green after the
  manifest edits (no dead/undeclared deps).
- **A-1/A-2:** a scripted cycle check over workspace manifests reports 0
  cycles; ARCHITECTURE.md rows regenerate from manifests (add a check or
  document the manual rule).
- **Wave 2/3:** each item lands with the regression spec named in its finding
  (conditional config-props boot, secrets-field-mode message, refresh teardown,
  MockHTTP 401/403, `toRegExp('my-pattern')`, cached-credential pair,
  HashRouter hash sync, `fileThreshold: 0` spill, bodied fetch-credentials
  POST, `Cookies.getJSON('missing')`, varchar/string-PK DDL round trip,
  counted datapoint export, scheduler exit timing, Buffer byteLength, OAS
  nullable/literal/tuple).
- **Wave 4/5:** README/manifest gates after standards fixes; `pnpm docs:links`
  after doc sweeps; `pnpm doc:check` after JSDoc/template changes; generator
  specs assert manifest conformance of scaffolded output.
- **Wave 6:** the full gate list above at head, with the two new gates
  (`pnpm build`, cycle check) recorded as part of the review checklist.

### Wave 1 execution (2026-10-06)

- `pnpm exec nx reset && pnpm build` → **38/38 projects green** (was: circular
  Nx task graph, exit 1); manifest-level cycle scan over all 46 workspace
  manifests → **0 cycles** (was 5 at `5a7a9e20`).
- New package `packages/blue-log` (`@blue/log`) carries the moved logger +
  severity modules and their specs; AD-67 recorded; ARCHITECTURE layer table,
  mermaid graph, and Package Map regenerated from the manifests.
- `pnpm manifest:check` green; focused suites 33 files / **168 tests green**
  (blue-log 8, blue-factory 61, telemetry core/node/web incl. trace
  correlation, blue-test, blue-platform-node adapter); `pnpm lint` green.
- Removed: `@blue/telemetry/logger` subpath, node/web instrumentation forks,
  dead node `CountedInstrumentation`; the core dispatcher instrumentation
  gained the `_resolveViewName` span (exercised by the node correlation spec).
- Fixed a pre-existing cross-suite flake the full gate surfaced: the
  `blue-platform-node` SEC-6 temp-file spec scanned the shared `os.tmpdir()`
  and raced parallel blue-api spills — now file-filtered with a bounded
  quiesce (`packages/blue-platform-node/test/multipart-http.spec.ts:174-210`).

### Wave 2 execution (2026-10-06)

- **CF-1** conditional gates now also cover `@configurationProperties`
  auto-registration, refresh rebind, and `@environment` schema collection
  (`blue-boot/src/application.ts`); the four new specs reproduced the boot
  failure before the fix.
- **CF-2** bind-error messages no longer interpolate the property value
  (`blue-boot/src/configuration-properties.ts`); the secrets spec asserts
  neither marker nor plaintext appears in the failure chain.
- **CF-3** refresh-scoped `@destroyable`/`@closeable` values tear down exactly
  once on `clear()` (`blue-factory/src/abstract-factory.ts`); registration is
  gated to the refresh scope because the singleton hook would double-run via
  `destroyValue`.
- **IN-1** MockHTTP finalizes interceptor denials through the adapter's shared
  `finalizeInterceptorDenial` (`blue-platform-node/src/finalize-denial.ts`);
  the blue-api workaround is deleted; 3 specs cover 403/401+challenge/302.
- **IN-2** `toRegExp` parses only a strict `/pattern/flags` shape; plain
  patterns containing flag letters compile as literals (integrator re-probe).
- **HT-1** `postResponse` now receives the final sent Request (optional third
  parameter threaded by the execution chain); `CacheInterceptor` gates on it,
  so credentialed responses are neither stored nor served.
- Focused specs: 6 files / 44 tests green; full gates re-run after integration.

### Wave 3 execution (2026-10-06)

- **PL-1** `HashRouter` writes `location.hash` on successful public routes
  (with self-echo suppression) and restores it on rejection; `_restoreHash`
  now compares route-form values. **PL-3** `FetchCredentialsInterceptor`
  clones the request (signal/mode/redirect/cache/integrity preserved; bodied
  POST works under undici). **PL-4** `Cookies.get/getJSON` return `undefined`
  for absent keys; the verified-dead parser-failure fallback was deleted.
- **PL-2** `fileThreshold: 0` forces disk (`size > threshold` gate);
  negative/non-finite `MultipartLimits` fail loud with a `RangeError`.
- **DA-1** shared metadata→SQLite mapping (`_column-types.ts`) used by both
  `createTableStatements` and `drizzleTableForEntity`; string PKs round-trip
  (integrator re-probe: `id NUMERIC PRIMARY KEY`, `title TEXT`).
- **OP-1** `@counted` counters resolve lazily via the previously dead
  `_patchCount`; export verified with a real meter provider registered after
  construction. **OP-2** the `maxRunTime` cap timer is cleared when the run
  settles (exit-probe: 2003 ms → 12 ms).
- **PR-1** binary sends copy the exact view window (Buffer slab 8192 → 5
  bytes in the transport-double spec). **PR-2** schemas convert with the
  `openapi-3.0` target (`nullable`/`enum`/`items`).
- Integration fix-ups: doc-header order in the socket spec; `Promise.all`
  over limit cases to satisfy `no-await-in-loop`.

### Wave 4a execution (2026-10-06)

- **SE-1/SE-2** `JWTAdapter` requires `exp` + `sub` (`requiredClaims`),
  rejects missing/empty `sub` instead of `'unknown'`, adds
  `clockToleranceSeconds`, and rejects HS* secrets under 32 bytes at
  construction; all test secrets migrated. Integrator re-probe: exp-less →
  `null`, sub-less → `null`, 1-byte secret → constructor error.
- **SE-4/SE-3** the management mapping prepends
  `SecurityHeadersInterceptor` (`@blue/platform-node` dependency added,
  acyclic — verified by `pnpm build`); `/health` + `/metrics` spec asserts
  nosniff + CSP; guide 11 §8 and the management README now prescribe an
  unconditional guard (AuthRouteGuard called out as metadata-driven/inert).
- **TO-1** `blue-auth-core`'s decorators file promoted to
  `src/decorators.ts` (AD-46 revisit trigger); the oxlint
  `no-internal-file-exports` rule now flags named re-exports and
  `no-internal-file-imports` flags `export *` — one whole-repo lint run
  proves no other violations; AD-46 gained an Update note.
- **DO-1/DO-2** proxy/resilience/redis/cache/openapi/orm-drizzle READMEs
  rewritten to the package-documentation standard (no AD/plan/verification
  references; standard H2 sets; exports/signatures verified against src).
  Widening `check-manifests` to assert the H2 set is deferred to Wave 5,
  when the remaining READMEs are aligned.
- **SE-6** auth-client/auth-server READMEs rewritten against the real guard
  APIs; the new snippets were type-checked against package sources
  (fail-before: the old snippets produced five TS errors).

### Wave 4b execution (2026-10-06)

Fifteen package-disjoint slices; every code item landed with a
fail-before/pass-after spec (evidence in the slice reports).

- **Kernel/boot/factory:** nested `@defaultValue` conversion and post-context
  boot cleanup (CF-4, CF-6); `init()` failures now propagate (CF-5);
  `InitializationAwareProcessor` TSDoc corrected (CF-8); guide 03 + AD-13
  aligned on the unshipped dotenv slot (CF-7).
- **HTTP/dispatcher:** timeout timer release + caller-signal composition
  (HT-2, HT-5); bodyless/empty-body handling and `preRequest` failure routing
  (HT-3); base-class mapping discovery and preserved unmapped errors
  (HT-4, HT-6).
- **Platform/views:** BrowserRouter full interceptor phases + mapped params
  (PL-5); offline replay preserves method/headers/body (PL-7); socket-probe
  memo no longer grows per parameterized path (PL-8); delegated events
  survive reconnect (PL-6); signals inheritance limitation documented with a
  two-cause error (IN-3).
- **Data:** Drizzle boolean/json decode with re-save round-trip (DA-2);
  in-memory transaction snapshot/restore deep-clones stores (DA-3, decision
  recorded); derived-query docs corrected (DA-4).
- **Telemetry/ops:** router spans promise-aware (OP-3); `/metrics` durations
  restored (OP-4); HTTP span status/ERROR (OP-5); base-class enable latch
  (OP-6); circuit-breaker validation (OP-7); node log-exporter switches
  `LoggerFactory` (OP-8); `sdk.shutdown()` documented + wired in blue-api
  (OP-9); `fatal`/`critical` severity (OP-10).
- **Tooling/apps:** generators `build:lib` (TO-2), nx cleanup + `build:todomvc`
  rewiring (TO-3), scaffold manifest conformance (TO-4), `@module blue-<name>`
  (TO-5), dead migration script removed (TO-6), guide-12 files row (TO-7),
  blue-util stale scripts deleted (HG-5); AP-1..AP-4 (counter renders, host
  nav links, `/report` production chunk verified via build+preview, island
  `dev` flow).
- Integration fix-ups: three `no-await-in-loop` spec restructurings
  (timeout ×2, socket-probe ×3 loops).

### Wave 4c/5 execution (2026-10-06)

Eighteen package-disjoint slices; every code item landed with a
fail-before/pass-after spec (evidence in the slice reports). Highlights:

- **Protocol/service:** STOMP `maxUnacked: 0` id-only ACK no longer closes;
  duplicate receipt ids reject; queue capacity no longer byte-budgeted;
  SSE phantom events gone; service proxy delegates `Object.prototype`
  members; `streamCall` spans flag failures; OpenAPI hoists recursive
  schemas into `components.schemas` and synthesizes path parameters.
- **Auth/data:** OIDC injection `pendingStore` seam (cross-instance callback
  spec); `getErrorMessage` promoted to `@blue/util` and migrated at all 12
  sites; set-based repository count/exists/delete; Redis error recency +
  `lastDecodeError`; shared `resolveCacheName`; `@cached` detached receiver.
- **Framework/platform:** `@property` binds without `@propertySource`;
  parser follows environment changes; factory contracts documented;
  `getInstance` returns registered values as-is; streamed renders honor
  backpressure; formatting fails loud without a locale; node view target
  delegates entity serialization; `OfflineInterceptor.dispose()`; content
  negotiation threads the request per call (global holder deleted);
  condition semantics (empty value/repeated keys), mapping-name registry,
  canonical Accept folding, duplicate-prefix and sparse-map fail-loud.
- **Harness/tooling/docs:** MockHTTP query/socket/OPTIONS/405 parity;
  root `lint` builds the plugin first; benchmark bundle resolution + preview
  reaping; root dead devDeps and `vite.config.lib.ts` removed; root
  `typecheck` script + CI lane covering every app; docs-link gate widened to
  package/app READMEs; audit moderates cleared; plans/migrations indexes
  completed; CSP docs aligned with SEC-4; guides 17 (static files) and 18
  (signals & islands) added; every package README now meets the enforced
  section standard (gate widened with it); app READMEs/deps corrected;
  blue-api matrix tests.
- Integration fix-up: one `no-await-in-loop` restructure (scheduler
  wall-clock poll helper).

### Wave 6 — close-out and final verification (2026-10-06)

- **HG-4**: 30 pnpm catalog entries (108 references across 35 manifests),
  lockfile catalog blocks, frozen install green; TypeScript normalized to
  `~7.0.2` for all workspace packages (the 5 residual `6.0.3` pins were
  pre-Sep-10 leftovers; every package compiles under 7.0.2 — verified before
  and after — and the TypeDoc store pin is preserved).
- **HG-6**: `delay(ms)` implemented once in `@blue/util` and re-exported from
  `@blue/test` (the literal @blue/test devDep for platform-node would have
  re-closed an Nx task-graph cycle — proven, then avoided; 9 sites migrated).
- **SE-7..SE-12, HG-9/HG-10**: disabled/deleted accounts revoke sessions and
  JWTs at validation; `__Host-blue-csrf` CSRF hardening; remote-config fetch
  timeout + size cap; cookie attribute writing hardened; session JSDoc;
  shared `readIntEnv`; mock header-folding cross-reference.
- **Final gates at close-out:** `pnpm format:check`, `pnpm lint`
  (build-first plugin), `pnpm manifest:check` (README-section + root-devDep
  rules), `pnpm typecheck` (every package + app), `pnpm build` (39/39),
  `pnpm test` (43/43), `pnpm doc` freshness, `pnpm docs:links`,
  `pnpm agents:check` — all green; `pnpm audit --prod` reduced to the single
  accepted sibling-checkout advisory.
- **Live smoke:** `apps/blue-hello-node` booted on tsx and served
  `GET /` → `200 {"message":"Hello, Node!"}` with the SEC-4-hardened header
  set on the wire (CSP `connect-src 'self'`, HSTS, nosniff, …).

### Post-closure: SE-7 deep dive (2026-10-06, AD-68)

- **User-wide revocation:** `SessionStore.deleteForUser(userId)` (required
  contract method; in-memory sweep + LibSQL `DELETE … WHERE principal_id = ?
AND expires_at > ?`) and `CredentialsAuthAdapter.logoutAll(userId)`
  (sessions deleted + `tokenVersion` bumped ⇒ every outstanding JWT dies).
  `refresh` now rejects disabled/deleted accounts; `SessionRecord.tokenVersion`
  is documented as informational only (JWT rotation advances the counter, so
  sessions must not compare it).
- **Refresh-token credential leak (found while digging):** `validate` had no
  `token_use` gate, so a framework refresh token (7-day TTL, `sub`+`ver`+`exp`)
  authenticated API requests. Fixed: only `token_use: 'access'` (or an absent
  claim, for external IdP tokens) validates.
- **Probe:** access vs refresh claims decoded side by side; `validate(refresh)`
  → `null`; `logoutAll('alice')` → `{sessions: 2, tokenVersion: 1}`, both
  sessions and the access token dead afterwards.
- Gates re-run after the change (build/test/typecheck/lint/manifest/doc).
