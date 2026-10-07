# Comprehensive Review and Mitigation — 2026-10-06 (second full-repository sweep)

**Date:** 2026-10-06
**Scope:** Whole repository at `96337f24` (master, clean tree): all 39 packages under
`packages/`, 7 apps under `apps/`, `docs/` (guides, architecture, reference, decisions,
migrations, plans, audits), root tooling and CI.
**Relation to the first sweep:** `docs/plans/2026-10-06_CODE_REVIEW_AND_MITIGATION.md`
(the first full-repository sweep, same day) had all of its waves executed and verified at
HEAD. This second sweep re-ran the full gate set, re-checked a sample of the first sweep's
fixes for regressions, and hunted new issues with fresh slices; it does **not** re-report
first-sweep findings unless they are demonstrably still open or regressed (marked
`[still-open]` / `[regression]` below).
**Method:** 16 parallel read-only review slices — 12 code/security reviews by area, a
quality-gate runner, a documentation reviewer, a feature-inventory reconciler, and an
external framework comparison. Every finding carries `file:line` evidence labelled
`[code]` (read), `[exec]` (executed probe/spec) or `[inference]`. The integrator then
independently re-verified headline claims: the passwordless-account auth bypass
(reproduced with a throwaway spec), the telemetry request-target crash mechanism
(`new URL('http://[', base)` throws; wrapper evaluates it before the adapter), the radix
alias/param corruption (reproduced via `tsx`), the stale `AD-01..AD-67` ranges, the CI
e2e fresh-checkout failure path, and the stale `vitest.config.ts` alias targets. Working
tree was clean before and after; throwaway probes were removed.
**Status:** Findings recorded; **all waves executed and verified (2026-10-06).**
Waves 1–2 landed in `91712f40` (security + availability), waves 3–4 in
`8f54a402` (context/boot, HTTP, data, ops, protocols,
telemetry/resilience, platform-web, kernel-2, tooling, docs, apps), wave 5 in
`fbb5233e` (framework `console.*` → `@blue/log` migration across 10
packages, `@blue/test` synchronous-rAF helper with app-spec migration,
skipped-test policy, OpenAPI auto-config security forwarding, app-manifest
checker, Redis CI service lane, benchmark exit code), and the wave-4
dispatcher/views mop-up in `0c4becbd` (view-cache key collision +
bound, dead interceptor guard, island-resolver defaults + custom-element
validation, 406 negotiation, request-copy negotiation, error-name hierarchy
mapping, EJS filename/includes, resolver dedup; CI graft pin; AD citation
refresh). All 46 test projects and the full gate set are green.
Residuals tracked for follow-up: the test-file typecheck lane (TOL-F5 —
requires 46 per-project `tsconfig.spec.json` files plus triage of pre-existing
test type errors), TEL-08's client byte-size seam is exposed by `@blue/socket`
(`onSend`) but not yet consumed by the web instrumentation, and the wave-6
product roadmap (gaps 1–13: jobs/outbox, cluster runtime, distributed locks,
actuator parity, OTel metrics, CLI, migration generation, shared rate-limit
store, containerized test glue) which needs ADRs and owner sign-off before
implementation.

**Post-plan discoveries (fixed in follow-up commits):** the app client bundles
shipped raw TC39 decorators — Vite 8's oxc transform cannot lower them and
Vitest's esbuild pipeline masked it, so blue-island and blue-todo production
bundles were invalid JavaScript — and blue-todo's todo routes omitted `items`,
so the Playwright e2e lane was failing end-to-end (build order, bundle syntax,
and seeding were all broken); both are fixed (`60d601ca` — valid client
bundles, todo seeding, Vite lower-decorators plugin) and the e2e passes
locally. AD-69 records the component-integration contract (adopt the Web
Component ecosystem; framework owns the DSD first-paint and FACE bridges) with
its spike (`4ee4a41f`); AD-70 adds the `@blue/inspect` configuration JSON
Schema plus the two oxlint rules that enforce it (`f6cdf832`); AD-71 selects
Web Awesome for the single reference integration and lands it in
`apps/blue-island` (FACE form → `POST /items` → `dataBinderValue` + Zod → SSE)
with [guide 21](../guides/21-component-integration.md) (`76d28575`) — framework
packages stay library-free.

**Legend:** `block` = release/CI or availability/security breaker · `high` = must fix before
1.0 · `medium` = should fix · `low`/`nit` = cleanup.
**Qualified finding IDs:** `<area>-<local id>` where area ∈ {KRN kernel, CTX context/boot,
HTT http/test, PLN platform-node, DSV dispatcher/views, DAT data, PRT protocols, TEL
telemetry/resilience, PWB platform-web, SEC auth/security, TOL tooling, APP apps, DOC docs,
INV inventory, GAP industry}.

---

## 0. Gate baseline (run at `96337f24`, clean tree)

| Gate                   | Result | Evidence                                                                                     |
| :--------------------- | :----- | :------------------------------------------------------------------------------------------- |
| `pnpm build`           | ✅     | 39 projects, 23 cache hits, 16 fresh; exit 0                                                 |
| `pnpm test`            | ✅     | 43 projects green; 0/43 cache hits (all executed), 63.9 s                                    |
| `pnpm lint`            | ✅     | `oxlint --type-aware --deny-warnings`, zero diagnostics (probe-verified loud on dirty input) |
| `pnpm format:check`    | ✅     | 1590 files formatted                                                                         |
| `pnpm docs:links`      | ✅     | 272 files / 995 relative links                                                               |
| `pnpm audit --prod`    | ✅     | No known vulnerabilities                                                                     |
| `pnpm manifest:check`  | ✅     | All packages + root conform                                                                  |
| `pnpm agents:check`    | ✅     | 63 generated + 3 repo-owned files match manifests                                            |
| `pnpm typecheck`       | ✅     | `tsc -b` zero diagnostics (note: build config only — see TOL-F5)                             |
| `pnpm doc` + freshness | ✅     | Regeneration byte-identical; `git diff` empty                                                |

Process note: the green board hides five block-class defects (below) because the gates do
not exercise: fresh-checkout e2e builds, non-DOM imports of `@blue/platform-web`,
malformed request targets with telemetry on, throwing view renders, and demo shell routing.

---

## 1. Block findings (5)

### SEC-B1 `[exec]` Passwordless accounts authenticate with the hardcoded dummy password (account takeover)

- **Where:** `packages/blue-auth-server/src/credentials-auth-adapter.ts:104-106`
  (`const hash = user?.passwordHash ?? this.#dummyHashValue();` … `if (!valid || user === null || user.disabled === true)`);
  contract contradicts it: `packages/blue-auth-core/src/user-store.ts:23-24` (“A `null` hash
  never matches a password attempt”) and `docs/guides/11-authentication-and-sessions.md:89`.
- **Evidence:** `[code]` the dummy hash (used for unknown-user timing equalization) is also
  substituted as the _verification target_ whenever an existing user's `passwordHash` is
  `null`/`undefined`; the guard only rejects `user === null`. `[exec]` integrator probe
  (throwaway spec, removed): `InMemoryUserStore([{id:'u1', passwordHash:null}])` +
  `password: 'bluejs-dummy-password-for-timing-equalization'` →
  `ACCEPTED principal=u1 validate=ok` (session token issued and validated); wrong password
  rejected. The existing spec only submits `password: ''`, so CI stays green
  (`packages/blue-auth-server/test/credentials-auth-adapter.spec.ts:161-166`).
- **Impact:** Full account takeover (opaque session + HttpOnly cookie) for any
  OIDC/federated/invited/bootstrap account whose store projects no hash; the constant ships
  in the package. Guide 11's ORM example maps a nullable column straight through.
- **Fix:** use the dummy hash strictly as a timing sink: capture
  `stored = typeof user?.passwordHash === 'string' && user.passwordHash.length > 0 ? user.passwordHash : null`,
  verify against `stored ?? dummy`, and reject when `user === null || stored === null || user.disabled`.
  Regression cases: dummy constant against `null`, `undefined`, `''` hashes (and normal
  wrong-password). Wave 1.

### TEL-B1 `[exec]` Telemetry instrumentation crashes the process on a malformed request target (remote DoS)

- **Where:** `packages/blue-telemetry-node/src/instrumentation/http-server/http-server.ts:68-76` —
  `'http.route': req.url ? String(new URL(req.url, 'http://local').pathname) : undefined`
  is evaluated synchronously in the shimmer wrapper **before** `original.apply` and outside
  every try/catch; the adapter invokes it as `void this.handleRequest(req, res)`
  (`packages/blue-platform-node/src/node-http-server-adapter.ts:346-348`).
- **Evidence:** `[code]`+`[exec]` (integrator): `new URL('http://[', 'http://local')` throws
  `Invalid URL`; Node/llhttp delivers `req.url === 'http://['` for a raw
  `GET http://[ HTTP/1.1` request. Slice probe with the real instrumentation + real adapter:
  one raw socket request → `UNCAUGHT: Invalid URL`; Node's default policy exits the process.
- **Impact:** Unauthenticated remote process kill whenever the instrumentation is enabled
  (blue-api enables it with `OTEL_EXPORTER_OTLP_ENDPOINT`).
- **Fix:** parse defensively (`try { path = new URL(...).pathname } catch { path = undefined }`
  or `req.url.split('?')[0]`); wrap `config.attributes?.()` in `AbstractBaseInstrumentation._patch`
  in try/catch; regression spec posting a raw malformed target. Wave 2.

### DSV-B1 `[exec]` A throwing view render/resolver leaves the HTTP response open — requests hang instead of 500/404

- **Where:** `packages/blue-dispatcher/src/dispatcher.ts:335-343` — `render()` failures are
  captured into `dispatchError` and swallowed (`_processDispatchResult` returns normally);
  `packages/blue-platform-node/src/node-http-server-adapter.ts:1012-1031` finalizes only on
  a denial or `noHandler`, so a matched route writes nothing.
- **Evidence:** `[exec]` slice probe (real dispatcher + adapter): `GET /ok` → 200;
  `GET /boom` (handler returns a `ModelAndView` whose `render` throws) → client timeout, no
  bytes; same for a missing EJS template.
- **Impact:** Any failing template/resolver (missing file, EJS syntax error, dynamic-import
  failure, circular JSON) hangs every request to that route — DoS surface, no 500, no log.
- **Fix:** after dispatch, if `!res.writableEnded && !res.destroyed` finalize a 500 problem
  (or let `_processDispatchResult` rethrow after `triggerCompleteHandle` so the adapter's
  catch handles it); spec: view-render throw → terminal 500. Wave 2.

### CI-B1 `[code]` `[regression]` CI e2e job cannot build the app on a fresh runner (workspace `lib/` outputs never built in that job)

- **Where:** `.github/workflows/ci.yml:143-146` runs `pnpm --filter @blue/todo build` after
  only `pnpm install`; libraries are built only in the separate `quality` job (line 46-47)
  and jobs do not share a filesystem. `**/lib/` is gitignored (`.gitignore:31`);
  `apps/blue-todo`'s build is a bare `vite build` (no nx `dependsOn`), and 39 runtime
  `@blue/*` imports resolve through package `exports` → `lib/`.
- **Evidence:** `[code]` (integrator, above) + slice probe: `git archive HEAD` to `/tmp`,
  `pnpm install`, `pnpm --filter @blue/todo build` → `Rolldown failed to resolve import
  "@blue/telemetry-web"`. The “fix broken E2E job” commit only worked on a workstation with
  prebuilt `lib/`.
- **Impact:** The e2e lane is red on any real GitHub runner; the workflow's green status is
  misleading.
- **Fix:** build libraries in the e2e job (`pnpm build && pnpm --filter @blue/todo build`) or
  give the app target `dependsOn: ["^build:lib"]`. Wave 2 (cheap).

### APP-B1 `[exec]` blue-todo Account feature is unreachable: partition prefix stripped before dispatch while AccountController registers `/account`-prefixed mappings

- **Where:** `packages/blue-router/src/partition-router.ts:124` strips the mount prefix
  before the feature callback; `apps/blue-todo/src/account-controller.ts:11,13,25` registers
  `/account` and `/account/settings`, unlike root-relative `index-controller.ts:14,26-58`.
- **Evidence:** `[exec]` slice probe against `composeTodoRuntime()` + `HashRouter`:
  `#/account` → dispatcher gets `''` → renders `todo-app`; `#/account/settings` →
  `IllegalStateError: No handler adapter found`; `#/auth/*` likewise. Tests dispatch
  `AccountController` directly (`apps/blue-todo/test/browser-controller.spec.ts:23-38`) and
  shell tests assert only mount flags, so the wiring gap is invisible.
- **Impact:** The demo's Account nav renders the Todo app; a headline app path is broken.
- **Fix:** pick one convention — make `AccountController` root-relative like `IndexController`,
  or dispatch the restored full path in the account feature's `onRoute`; add shell-router
  rendering specs for `#/account` and `#/account/settings`. Wave 2.

---

## 2. High findings (28)

### Kernel (`packages/blue-core`, `blue-util`, `blue-factory`, `blue-proxy`, `blue-dom`, `blue-signals`, `blue-log`)

- **KRN-REV-RADIX-01 `[exec]` RadixTree aliases distinct patterns onto shared nodes.**
  `radix-tree.ts:166-193,425-441`: param/greedy children are reused without label checks;
  integrator probe: `insert('/b/:foo'); insert('/b/:bar')` → `{value:'second',
  params:{foo:'z'}, pattern:'/b/:bar'}`; `delete('/a/:id'); insert('/a/:name')` → params keyed
  `id`. Two controllers with the same shape but different variable names silently alias —
  one route unreachable, the survivor binds `undefined` path variables (dispatcher reads
  `route.params`, `radix-metadata-handler-mapping.ts:88-95`). Fix: one registration per
  (kind,label) or reject conflicting shapes at insert; clear only the exact pattern on delete;
  specs for rename-after-delete, dual labels, `**` vs `{*name}` both orders. Wave 3.
- **KRN-REV-CORE-02 `[exec]` `MutablePropertyValues` is a fixed 32-slot ring.**
  `property-value.ts:145` (`super(32)`) + ring overwrite; probe: 40 form/query fields → only
  the last 32 bind, silently (real binding path `abstract-platform-resolver.ts:121-128`).
  Fix: growable backing store (or auto-grow) with >32-key and wrap-order specs. Wave 3.
- **KRN-REV-DOM-03 `[exec]` `LinkedomDOMProvider.parseHTML` violates the DOMProvider contract**
  for fragments/plain text (`linkedom-dom-provider.ts:31-34`): empty `body`, throwing body
  getter vs the browser provider. Fix: wrap fragment input in a full document or share one
  normalization; add a cross-provider parity suite. Wave 3.

### Context/Boot (`packages/blue-context`, `blue-boot`)

- **CTX-CTX-01 `[exec]` `{ relaxed: true }` binding can never work.** Every relaxed hit is
  followed by an exact-path typed re-read that fails boot (`configuration-properties.ts:139,
  209 vs 232, 282, 465 vs 490`): `server.host-name` + `@property('hostName')` →
  `Missing required property "server.hostName"`; reverse direction → `Required property
  "srv.host-name" missing`. Documented contract AD-15 D3. Fix: `valueAt` returns the winning
  key and the typed read uses it; specs both directions. Wave 3.
- **CTX-CTX-02 `[exec]` `[still-open]` Decrypted secret plaintext echoed by the boot
  environment-validation error.** Probe: `@environment` schema failure prints
  `got "super-secret-hunter2"` (the decrypted value), contradicting guide 03's redaction
  guarantee — the CF-2 family fix covered only the resolver message. Fix: redact
  `issue.actual` when a decryptor is configured; spec asserting neither marker nor plaintext. Wave 3.
- **CTX-CTX-03 `[exec]` Same leak via Boolean/Date conversion errors during binding**
  (`Cannot bind SecBool.enabled ... Invalid boolean value: super-secret-hunter2`). Fix: wrap
  converter failures with `#diagnosticValue(value)` (or stop converters echoing raw input);
  extend the secrets spec. Wave 3.

### HTTP client + harness (`packages/blue-http`, `blue-test`)

- **HTT-REV-001 `[exec]` Retry's pristine-body clone misses when a later interceptor
  replaces the Request.** `retry-interceptor.ts:64,84,144,151` keys the WeakMap on the request
  it saw; `http-client.ts:196,203` passes the replaced request to `applyPostError`; auth/header
  interceptors rebuild the Request. Probe: `[Retry, AuthLike, NotOK]` POST → caller rejects
  `TypeError: Response body object should not be disturbed or locked`, fetch called once;
  reversed order works. Fix: thread a stable per-request identity into `applyPostError` (or
  clone at the fetch boundary); regression spec. Wave 3.
- **HTT-REV-002 `[exec]` Cache hits skip the entire `postResponse` pipeline**
  (`http-client.ts:192-194` vs `198`). Probe: `responseTransforms` + cache → miss
  `{"n":1,"transformed":true}`, hit `{"n":1}`; `ResponseType.data` undefined on hits. Fix:
  run `applyPostResponse` on the short-circuit branch; hit-vs-miss equality spec. Wave 3.
- **HTT-REV-003 `[exec]` `ResponseTypeInterceptor` consumes the body; a later clone/read
  interceptor turns a 200 into an empty 418** (`response-type-interceptor.ts:184-185`).
  Fix: parse via `response.clone()` (as TransformInterceptor does); ordering contract + spec. Wave 3.
- **HTT-REV-004 `[exec]` Cache stores and replays `Set-Cookie`-credentialed payloads**
  (`cache-interceptor.ts:102-137,145-147`). Probe: GET returning `Set-Cookie` cached, then
  replayed to a later caller. Fix: refuse to store responses carrying `Set-Cookie` or
  `Cache-Control: private/no-store`; regression spec. Wave 3.
- **HTT-REV-012 `[exec]` MockHTTP diverges from the real adapter for malformed bodies:**
  mock returns 500/wrong problem type where the adapter returns 400
  (`mock-http.ts:368-388` vs `node-http-server-adapter.ts:1054-1086`). Fix: share the adapter's
  error mapping; specs mirroring `http-boundaries.spec.ts`. Wave 3.

### Platform (Node) (`packages/blue-platform-node`, server side of `blue-service`)

- **PLN-F1 `[exec]` Precompressed static variants bypass base-directory containment.**
  `static-resource-resolver.ts:216-225` contains the main path, but `:268` → `_statVariant`
  (`:298-305`) stats `${real}.${br|gz}` with no realpath/containment re-check; probe: a
  `file.txt.br → /outside/secret` symlink in the root is followed and served (with the
  original's Content-Type + `Content-Encoding: br`). Fix: re-run realpath + `base + sep`
  containment on the variant (or refuse symlinked variants); regression test mirroring the
  `escape.lnk` case. **Security.** Wave 1.
- **PLN-F2 `[exec]` Static file serving wedges and leaks the fd when a backpressured client
  aborts** (`static-resource-handler.ts:398-409` waits `once(res,'drain')`; abort emits
  `close`). Probe: 64 MiB file + non-reading client destroyed → handler never settles, file fd
  still open 2.5 s later; also survives adapter shutdown. Fix: race `drain` with `close`,
  destroy the stream in `finally`; real-`ServerResponse` abort test. Wave 2.
- **PLN-F3 `[exec]` Same drain hang in `writeRenderResult`** (`producer-writer.ts:42-56`) keeps
  streaming producers/SSE generators alive after client abort (probe: generator `finally`
  never ran). Fix: same close-race + call the iterator's `return()`/destroy; real-response
  abort test. Wave 2.
- **PLN-F5 `[exec]` Adapter error boundary throws `ERR_HTTP_HEADERS_SENT` after headers are
  flushed → unhandled rejection → process exit.** `#writeErrorResponse` treats only
  `writableEnded`, not `headersSent`; probe with real dispatcher produced an unhandled
  rejection. Fix: treat `headersSent` like ended (log + `res.destroy()`); per-interceptor
  `completeHandle` try/catch; `.catch` backstop on `handleRequest`. Wave 2.

### Dispatcher/views (`packages/blue-dispatcher`, `blue-view`, `blue-view-ejs`, `blue-view-webcomponent`)

- **DSV-SEC-1 `[exec]` View names are concatenated into resource paths/dynamic imports
  without containment — filesystem traversal (EJS file read + execution) and unvalidated
  dynamic import.** `ejs-view-resolver.ts:57` + `view-resolver.ts:193,184-196` +
  `file-system-resource-loader.ts:38-45` (bare `readFile`, no containment); route-derived
  default view names (`route-to-view-name-translator.ts:54-62`) after matrix-param stripping
  leave literal `..` (`node-http-server-adapter.ts:1227-1252`). End-to-end probe:
  `GET /..;x=1/..;x=1/tmp/traversed` → 200 with the outside file's content, EJS-evaluated.
  Fix: reject path-separator/`..` segments in view names and/or canonicalize + contain
  against the resolver root; containment re-check in the loader; add traversal specs.
  **Security.** Wave 1.
- **DSV-WEBCOMP-1 `[exec]` Island SSR→hydration encoding contract broken:** the demo writes
  URI-encoded models while `hydrateIslands` parses plain JSON → model null → component setter
  throws, island never hydrates. Fix: single shared encode/decode helper used by both sides;
  jsdom hydration spec. Wave 3.

### Data (`packages/blue-orm`, `blue-orm-drizzle`, `blue-cache`, `blue-redis`, `blue-scheduler`, `blue-management`, `blue-openapi`)

- **DAT-F1 `[exec]` DrizzleEntityManager lifecycle hooks diverge from InMemoryEntityManager:**
  `@preUpdate`/`@postLoad`/`@postRemove` never fire and `@prePersist` re-fires on every save
  (`drizzle-entity-manager.ts:36,97-115,217,279-294`); probe event sequences side by side;
  zero hook tests in the Drizzle suite. `[still-open]` — the 2026-09-05 assessment claims
  parity was fixed. Fix: share one lifecycle runner in `@blue/orm`; parity spec. Wave 3.

### Protocols (`packages/blue-socket`, `blue-redis` pubsub, SSE)

- **PRT-REV-001 `[exec]` StompClient `send()`/flush is not exception-safe:** invalid header
  input throws synchronously, strands the receipt entry (duplicate-receipt rejects), the
  flush loop aborts the whole queue, and the orphaned promise kills the process under Node's
  default policy. `stomp-client.ts:435,441,625-629,269,738-746`. Fix: exception-safe send,
  per-item fault-isolated flush, receipt cleanup; specs for invalid headers on connected and
  buffered paths. Wave 3.
- **PRT-REV-002 `[exec]` Retention/unacked byte budgets charge body octets only — header
  octets bypass every memory cap** (`message-store.ts:247,355`; `stomp-broker.ts:1661,1572,
  1149,1019`). Probe: 50 messages with 100 KB headers retained while `retainedBytes` reports
  50; ~1 GiB pinned per subscription vs a 1 MiB budget. Fix: charge serialized header octets
  wherever body octets are charged (or cap header bytes); specs with small bodies + large
  headers. Wave 3.

### Telemetry/resilience (`blue-telemetry*`, `blue-resilience`, `blue-log`)

- **TEL-TEL-02 `[exec]` Circuit breaker races under concurrency:** stale `cell.failures`
  reads lose counts (3 concurrent failures never open at threshold 2); no in-flight latch →
  all callers probe half-open simultaneously (4/4); a stale in-flight success re-closes an
  open circuit. `circuit-breaker.ts:124-171`. Fix: mutate the cell in place, atomic
  probe latch, epoch/generation check on outcomes; concurrency specs. Wave 3.
- **TEL-TEL-03 `[exec]` `@counted` auto-registration is dead code** — `CountedInstrumentation`
  never patches anything in production. Fix: make `@counted` wrap the method directly with a
  lazily resolved instrument (like `@traced`), deleting the registry/enable-scan indirection;
  export-assertion spec. Wave 3.

### Platform (web) (`packages/blue-platform-web`, `blue-router`, `blue-content*`, `blue-host`)

- **PWB-REV-001 `[exec]` The `@blue/platform-web` barrel cannot be imported outside a DOM:**
  module-level `currentLocale` → `Cookies.get('lang')` → `document.cookie` throws
  `ReferenceError` at import (`locale.ts:33,18`; `cookies.ts:136-137` unguarded although
  `set()` guards). `@blue/telemetry-web` fails identically via its static HashRouter import.
  Fix: guard `get()/getJSON` on `typeof document === 'undefined'` (symmetric with `set()`)
  and/or lazy-initialize `currentLocale`; Node-environment import spec for both barrels. Wave 3.

### Tooling (`packages/blue-oxlint-plugin`, `blue-generators`, root tooling/CI)

- **TOL-F2 `[high]` `[still-open]` Live AD-46 violation + rule gap:** `CountedRegistry` from
  `blue-telemetry/src/metrics/_registry.ts` reaches the public API via the sub-barrel
  `src/metrics/index.ts:6` + `src/index.ts:12`, and `no-internal-file-exports` only inspects
  `src/index.ts` (`isPublicIndexFile`), so the gate cannot catch the shape. Fix: promote
  `_registry.ts` to a public filename (or stop re-exporting it) and extend the rule matcher to
  `src/**/index.ts` with a fixture. Wave 5.

### Apps (`apps/*`)

- **APP-N2 `[high]` blue-todo `AuthRouterInterceptor` matches nothing — auth guards inert**
  (path comparison against a table keyed without the leading slash); no login page exists to
  demonstrate it. Fix: normalize the comparison, add HashRouter-level specs, then implement
  the login/profile/admin views or remove the dead auth surface. Wave 4.
- **APP-N3 `[high]` blue-island SSE push is silent for clients connecting after the 3-second
  boot ticker** — the headline demo is inert. Fix: emit the current snapshot as the first
  event per connection and/or keep the ticker while subscribers exist; late-subscriber spec. Wave 4.
- **APP-N4 `[high]` blue-host's only spec never runs anywhere** (no `test` script/target;
  `pnpm test` false-green). Fix: add `"test": "vitest run"` + devDependency; consider the
  same for blue-hello/blue-hello-node. Wave 4.
- **APP-N5 `[high]` blue-island's suite cannot pass on a clean checkout** (asserts against
  gitignored `dist/`; passes locally only because a stale `dist/` exists). Fix: prebuild the
  client in the test script, serve a fixture, or add the build step in CI. Wave 4.

## 3. Medium findings (71)

### Kernel

| ID                 | Finding                                                                                                                                                                                 | Fix                                                                                                                        |
| :----------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------- |
| KRN-REV-URLGLOB-04 | URL-glob extglob emits nested quantifiers → catastrophic backtracking (ReDoS) in route matching (`blue-core/src/url-glob.ts:323-336`).                                                  | Flatten quantified groups in `parseExtGlob`; fail closed via `safe-regex`; bounded-match spec.                             |
| KRN-REV-BINDER-05  | `DataBinder.requiredFields` can never pass: names compared against RingBuffer slot indices (`data-binder.ts:139-148`).                                                                  | Validate property names (`getPropertyValue(field) !== null`); positive/negative specs.                                     |
| KRN-REV-MEDIA-06   | `MediaType.withCharset` drops the `+suffix` (`application/problem+json` → `application/problem`).                                                                                       | Reconstruct `subtype+suffix`; spec.                                                                                        |
| KRN-REV-MEDIA-07   | `MediaType.for(type,'*',params)` interns without params in the key → cross-call contamination (`media-type.ts:349-365`).                                                                | Include canonicalized params in the intern key (or reject params with `*`).                                                |
| KRN-REV-MEDIA-08   | `MediaType.includes` treats `type/*+suffix` as a whole-subtype wildcard (`application/*+xml` includes `application/json`).                                                              | Suffix-specific matching; negative specs.                                                                                  |
| KRN-REV-WILD-09    | `WildcardConverter`/`WildcardExp` do not escape regex metacharacters (`wildcard-expression.ts:24`).                                                                                     | Escape metachars except the `*` wildcard; metachar specs.                                                                  |
| KRN-REV-SIGNALS-10 | `@reactive` destroy/dispose wiring fragile: subclass fields disable cleanup; getter-only accessors throw at construction (`blue-signals/src/_decorators.ts:227-252`).                   | Keep cleanup in a WeakMap; guarded non-enumerable wrapper; shadowing/accessor specs.                                       |
| KRN-REV-LOG-11     | `[still-open]` `LoggerFactory` type/threshold switches cannot reach loggers created at module load — `configureTelemetry` OTel routing stays partly inert (`logger-factory.ts:99-118`). | Lazily-resolved logger handles or reconfigure existing loggers; spec that a pre-created logger follows configureTelemetry. |
| KRN-REV-FACTORY-12 | `@hashScope`/route-scoped beans break context refresh; prototype-scoped beans eagerly instantiated and discarded (`abstract-factory.ts:229-256`).                                       | Skip non-singletons in the finish sweep; document route-scope lifecycle; boot spec.                                        |

### Context / Boot

| ID         | Finding                                                                                                                                                   | Fix                                                                 |
| :--------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------ |
| CTX-CTX-04 | Malformed marker-shaped strings throw on reads even with **no** decryptor wired (SEC-10 fail-open contract broken).                                       | Only throw when a decryptor is configured; spec.                    |
| CTX-CTX-05 | `context.close()` does not detach the boot rebind listener; a later environment refresh writes into the closed context.                                   | Detach on `context:close`; spec.                                    |
| CTX-CTX-06 | `close()` aborts mid-teardown when a `context:close` listener throws: `destroyed` stays false, children/beans survive.                                    | Exception-safe teardown (try/finally + swallow-and-log); spec.      |
| CTX-CTX-07 | `@propertySource` names collide (`source:${index}`): later config classes silently replace earlier sources and constructor-provided ones.                 | Namespace by class + monotonic id; specs.                           |
| CTX-CTX-08 | Conditional gating bypassed for route scanning: inactive sources populate `routeRegistry`.                                                                | Pass `activeSources` to `routes.scanSources`; extend CF-1 spec set. |
| CTX-CTX-09 | `ApplicationBuilder.run()` is not single-flight: concurrent calls boot twice and leak a context.                                                          | Cache the in-flight promise; `Promise.all([run(),run()])` spec.     |
| CTX-CTX-10 | String-target conversion broken: the `(String,String)` converter is `UUIDConverter`, so non-string → String binds crash (`value.trim is not a function`). | Pass-through/String converter + distinct UUID target; specs.        |
| CTX-CTX-11 | Untyped `@property` fields silently bind as String while TSDoc claims conversion (`port // -> number`).                                                   | Fix examples, document the inference rule; pin behavior.            |

### HTTP client / harness

| ID          | Finding                                                                                                                                                   | Fix                                                                                |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| HTT-REV-005 | Cache ignores `Vary` and `no-store`/`no-cache` directives.                                                                                                | Honor request/response cache directives; key or skip on Vary; specs.               |
| HTT-REV-006 | Retry replays non-idempotent requests and all statuses by default; internal attempt header goes on the wire and is caller-forgeable.                      | Default to idempotent methods + retryable statuses; carry the counter out of band. |
| HTT-REV-007 | Retry drops the caller's `AbortSignal` and ignores aborts during backoff.                                                                                 | Forward the signal; clear the backoff timer on abort; spec.                        |
| HTT-REV-008 | `ErrorNormalizationInterceptor.postError` throws (violating the hook contract), preempting later error-aware interceptors; misclassifies aborts/timeouts. | Exclude AbortError/TimeoutError; preserve cause; ordering specs.                   |
| HTT-REV-009 | Timeout timer survives exits that never reach `postComplete` (pre-init cancellation / rejected error chain).                                              | Clear on every exit path; `unref()`; resource-leak spec.                           |
| HTT-REV-010 | `postComplete` hooks are not isolated: a throwing completion interceptor discards the response/error.                                                     | Per-hook try/catch; spec.                                                          |
| HTT-REV-013 | MockHTTP multipart `rawBody` breaks on canonical-case `Content-Type` (case-insensitive header contract violated).                                         | Fold header lookups; spec.                                                         |
| HTT-REV-014 | MockHTTP skips transport limits (431 cookie cap, 413 body cap, 408/abort codes) → tests cannot reproduce adapter behavior.                                | Mirror adapter limits in the harness; parity specs.                                |

### Platform (Node)

| ID     | Finding                                                                                          | Fix                                                                                             |
| :----- | :----------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------- |
| PLN-F4 | A mid-stream producer failure leaves the HTTP response open forever (headers sent, never ended). | On recorded error with `headersSent && !writableEnded`: log + `res.destroy()`; error-path spec. |

### Dispatcher / views

| ID         | Finding                                                                                                                                                                   | Fix                                                                                   |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------------------------------------------------ |
| DSV-DISP-2 | Patterns normalizing to one radix node shadow each other (`/foo` vs `/foo/`, `/a/:id` vs `/a/{id}`); earlier handler unreachable, no `Ambiguous` error.                   | Register per normalized pattern or reject duplicates; specs.                          |
| DSV-DISP-3 | Param label first-registration-wins on a shared node (dispatcher-side manifestation of KRN-REV-RADIX-01).                                                                 | Fixed by the radix registration model; add dispatcher-level specs.                    |
| DSV-VIEW-1 | No acceptable representation surfaces as 404 “View not found” instead of 406.                                                                                             | Return 406 when negotiation fails but the route exists; spec.                         |
| DSV-VIEW-2 | `resolveMediaTypes` mutates the caller's request object; a reused route resolves against a stale `Accept` (`content-negotiation-view-resolver.ts:343-350`).               | Work on a copy / pass the hint explicitly; spec.                                      |
| DSV-DISP-4 | Error-name mappings are exact-match only: preconfigured `FrameworkError`/`ApplicationError` mappings are dead for subclasses; documented substring semantics don't exist. | Match by `instanceof`/name hierarchy; document; specs.                                |
| DSV-EJS-1  | EJS includes: relative includes never resolve (filename never passed) and un-awaited `include()` renders `[object Promise]` (async forced).                               | Thread `filename` through the engine; document/handle `await include`; include tests. |

### Data

| ID     | Finding                                                                                                                             | Fix                                                                                                 |
| :----- | :---------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------- |
| DAT-F2 | `InMemoryTransactionManager`: concurrent `run()` shares one boolean; one run's rollback discards another's committed writes.        | Fail loud on overlap like the Drizzle manager (or serialize); concurrency spec.                     |
| DAT-F3 | Non-PK `@generated()` columns unpersistable: DDL emits NOT NULL but persist omits the column.                                       | Drop NOT NULL (or declared DEFAULT) for non-PK generated columns, or reject at metadata time; spec. |
| DAT-F4 | `Date` on non-json columns JSON-encoded with quotes; reads back as a quoted string.                                                 | Special-case Date; restrict JSON encoding to declared json columns; round-trip spec.                |
| DAT-F5 | Eager relation loading is N+1 (one query per entity per relation, no FK dedup).                                                     | Batch per relation (IN query + group/assign) or document N+1; FK dedup removes the common case.     |
| DAT-F6 | `TaskScheduler`: `start()` with no tasks doesn't latch; `register()` never arms the loop — tasks registered after start never fire. | Separate started-latch from armed timer; re-arm on register/unregister; spec.                       |
| DAT-F7 | Snapshot/restore deep clone drops private class state: restored entities throw on private-field getters.                            | Document the public-state-only limitation or add a per-entity clone hook; spec.                     |

### Protocols

| ID          | Finding                                                                                                           | Fix                                                                               |
| :---------- | :---------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------- |
| PRT-REV-003 | CONNECT/CONNECTED headers are escaped/unescaped although STOMP 1.2 exempts those two frames.                      | Command-aware codec; round-trip specs with backslashes/colons.                    |
| PRT-REV-004 | Two subscriptions of one session share a message-id; the second id-only ACK/NACK fails closed.                    | Index id → subscription list; dual-subscription spec.                             |
| PRT-REV-005 | UNSUBSCRIBE of `/user/*` re-resolves the principal at removal — can leak the scope and deliver after unsubscribe. | Record the resolved principal on the Subscription at bind time; spec.             |
| PRT-REV-006 | MESSAGEs that fail to serialize are silently dropped; `publish()` and fanout peers can blackhole a destination.   | Validate/sanitize headers at publish/fanout; surface serialization faults; specs. |
| PRT-REV-007 | SSE parser ignores lone-CR line terminators and a leading BOM.                                                    | Split on `\r\n                                                                    | \r  | \n` with carry; strip BOM; specs. |
| PRT-REV-008 | `subscribe()` after the session ended returns a stream that never completes or yields.                            | Terminal guard mirroring `send()`; clear subscriptions; spec.                     |

### Telemetry / resilience

| ID         | Finding                                                                                                                                  | Fix                                                                                |
| :--------- | :--------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| TEL-TEL-04 | Browser: `useConsoleExporters: false` silently drops ALL application logs (no log pipeline, but `LoggerFactory` still switched to OTel). | Gate the switch on an actual log pipeline (mirror node); spec.                     |
| TEL-TEL-05 | `configureBrowserTelemetry` not idempotent, no flush/shutdown; batched spans lost on page unload.                                        | Once-per-process latch; shutdown handle; `pagehide`/`visibilitychange` forceFlush. |
| TEL-TEL-06 | `http.route` carries the raw request path (semconv misuse; unbounded cardinality).                                                       | Emit concrete path as `url.path`; set `http.route` only for templates.             |
| TEL-TEL-07 | Socket fan-out counters count broadcasts, not delivered messages/bytes; `recipients` discarded.                                          | Scale counters by recipients (or rename to fanout semantics); document units.      |

### Platform (web)

| ID          | Finding                                                                                                                    | Fix                                                                                         |
| :---------- | :------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| PWB-REV-002 | HashRouter does not roll back its in-memory route when `postHandle` fails (BrowserRouter does).                            | Mirror BrowserRouter's restore; port the spec.                                              |
| PWB-REV-003 | HashRouter rollback hash write not echo-suppressed: rejected external navigation re-dispatches the restored route.         | Route the rollback write through the echo-recording path; single-dispatch spec.             |
| PWB-REV-004 | BrowserRouter resets to the last PUBLIC route when a private navigation is rejected.                                       | Baseline = pre-call route for both branches; spec.                                          |
| PWB-REV-005 | Concurrent HashRouter navigations interleave: earlier navigation dropped, winner's callback fires twice.                   | Serialize navigation (single-flight or token); spec.                                        |
| PWB-REV-006 | Offline replay breaks when a later interceptor replaces the Request (disturbed-body TypeError).                            | Key clones by url+method (or replay through the client); reject `bodyUsed` fallbacks; spec. |
| PWB-REV-007 | Offline-at-preRequest queue bypasses the remaining interceptor chain and drains via bare fetch (stored `http` field dead). | Queue at postResponse/postComplete or drain through the client; remove dead field.          |
| PWB-REV-008 | `IndexedDBResourceLoader` caches a rejected open promise forever: one transient failure bricks the loader.                 | Clear the cached promise on rejection; fail-then-recover spec.                              |
| PWB-REV-011 | Exclusive activation policy fires `onDeactivate` for never-activated features and skips their deactivation metrics.        | Track the activated set; route through `#deactivate`; parity spec.                          |
| PWB-REV-012 | README documents `import { Cookies } from '@blue/platform-web'` but the barrel has no named `Cookies` export.              | Export it (or fix the README); add a README-snippet check.                                  |

### Auth / security

| ID             | Finding                                                                                                                                                                                                | Fix                                                                                                                                                              |
| :------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEC-AUD2-SEC-2 | Session cookie is not `__Host-`-prefixed and duplicate-cookie parsing is first-wins → session fixation via cookie tossing / HTTP planting (sibling-subdomain or non-Secure cookie beats the real one). | Rename to `__Host-blue-session` (defaults already satisfy the prefix rules); reject duplicate security-cookie names; document the trust assumption.              |
| SEC-AUD2-SEC-3 | Login CSRF reachable via form-encoded bodies while guide 11 asserts login is JSON-body only (probe: urlencoded POST → 200 + session cookie; CSRF interceptor is opt-in and unwired).                   | Correct the docs (login is cross-site-postable without CSRF); wire CSRF by default for cookie-session apps or enforce `Content-Type: application/json` on login. |

### Tooling / CI

| ID     | Finding                                                                                                                                                                                                                             | Fix                                                                                                                                |
| :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| TOL-F3 | Package generator writes a dead vitest alias for hyphenated names (doubled backslash) and its spec locks the bug in.                                                                                                                | Drop the escaping; spec builds `new RegExp` and asserts a match; fail loudly on anchor miss.                                       |
| TOL-F4 | Coverage configuration is dead and, by default, hides untested code.                                                                                                                                                                | Wire a real coverage lane with `include` + thresholds, or delete the dead block.                                                   |
| TOL-F5 | No lane type-checks test files anywhere in the repo.                                                                                                                                                                                | Add `tsconfig.spec.json` per package/app and extend `typecheck` (or `vitest --typecheck`).                                         |
| TOL-F6 | `[still-open]` The hand-maintained vitest alias table has drifted both ways (9 stale entries incl. `@blue/logger`, `@blue/auth`, `@blue/eslint-plugin`; 7 unaliased live packages); test source-resolution depends on built `lib/`. | Delete stale entries, add missing aliases, merge blue-orm's base config, add an alias-target existence check to the manifest gate. |

### Apps

| ID     | Finding                                                                                                                                 | Fix                                                                                                       |
| :----- | :-------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------- |
| APP-N6 | blue-todo relay gateway is registration-only; deactivate metrics hardcoded zeros.                                                       | Emit a real `todo:stats:updated`; assert receipt; resolve metrics from the gateway.                       |
| APP-N7 | `[still-open]` App manifests bypass every workspace gate: dead `vite-plugin-dts`, undeclared `@tsmetadata/polyfill` (phantom via root). | Extend the checker's dead/missing rules to app manifests (src/test/client/views/e2e dirs); fix manifests. |
| APP-N8 | blue-todo e2e cannot be run per README (no command; Playwright serves an unbuilt `dist/`).                                              | Document `pnpm build && pnpm test:e2e` or add a prebuild/webServer build.                                 |

### Documentation

| ID     | Finding                                                                                                                                                                                                | Fix                                                                                           |
| :----- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------- |
| DOC-01 | `[regression]` Stale `AD-01..AD-67` ranges in `ARCHITECTURE.md:1762`, `docs/README.md:11`, `docs/plans/README.md:6` while AD-68 exists.                                                                | Bump to AD-68 (or drop hard maxima in favor of the ADR index); add a range check to a script. |
| DOC-02 | ARCHITECTURE “peerDependencies … currently exactly two” contradicts the five allowlisted peers (`scripts/check-manifests.mjs:48-59`).                                                                  | Point at the single source (PEER_ALLOWLIST) or list the five.                                 |
| DOC-03 | Package Map runtime-dep column wrong for management, boot, generators (`ARCHITECTURE.md:1123,1134,1136`).                                                                                              | Backfill from manifests; consider generating the column.                                      |
| DOC-05 | STYLE_GUIDE enforcement markers contradict `.oxlintrc.json` (rules presented as review-only while they are error-level CI gates; no `@blue/no-*` rule names in living docs).                           | Add an `[AUTOMATED: oxlint]` marker for enforced sections; reference the rule names/config.   |
| DOC-12 | The Framework Gap Analysis — declared the “live document” in `docs/README.md:46` — is stale through the AD-41..AD-68 wave (session-store cell contradicts shipped LibSQL sessions; AD refs end at 40). | Update or demote it to a dated baseline (see §6).                                             |

---

## 4. Low and nit findings (75)

### Kernel

| ID                    | Finding                                                                                                                           | Fix                                                          |
| :-------------------- | :-------------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| KRN-REV-FACTORY-13    | HashScope never destroys cached values; callback-gating TSDoc wrong (`blue-factory/src/scope.ts:160-186`).                        | Record per-bucket destruction callbacks; correct TSDoc.      |
| KRN-REV-FACTORY-14    | Factory name lookups treat `Object.prototype` members as registered values.                                                       | `hasOwnProperty` checks in `hasInstance`/`hasConstructor`.   |
| KRN-REV-GLOB-15       | `GlobPatternInfo` counts `.*` only at pattern end (substring misuse, `path-matcher.ts:320-336`).                                  | Slice-check `.*` at any position; comparator cases.          |
| KRN-REV-SERIAL-16     | `serialize()` array-recursion branch dead; cyclic input throws raw `JSON.stringify` TypeError (`serializable.ts:108-123`).        | Reorder branches; try/catch in `isJSONValue`/`isJSONObject`. |
| KRN-REV-PROXY-17      | `interceptMethods` idempotency keyed on the proxy — re-weaving the raw target creates two independent proxies (`weave.ts:43-52`). | Track weaving on the target (WeakSet/WeakMap) or document.   |
| KRN-REV-MEDIA-18      | `MediaType.parseAccept` splits on commas inside quoted parameter values (`media-type.ts:434-445`).                                | Quote-aware splitting; spec.                                 |
| KRN-REV-RING-19 (nit) | `RingBuffer(capacity=NaN)` yields capacity 0, violating the MIN_CAPACITY clamp.                                                   | `Number.isFinite` guard or throw; boundary specs.            |
| KRN-REV-UTIL-20 (nit) | `toProper`/`toSentence` JSDoc examples don't match implementation.                                                                | Fix examples.                                                |

### Context / Boot

| ID               | Finding                                                                                            | Fix                                                                                |
| :--------------- | :------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- |
| CTX-CTX-12       | Profile-group precedence inverted: `BLUE_PROFILES_GROUPS` overrides CLI `--profiles.group.<name>`. | Env first, CLI last; spec.                                                         |
| CTX-CTX-13       | Refresh rebind replaces `@refreshScope` config instances without destroying the previous one.      | Destroy/close previous before `setValue`; spec counting destroys across refreshes. |
| CTX-CTX-14 (nit) | `close()` TSDoc sequence disagrees with implementation; omits `unsubscribeRefresh`.                | Align docs.                                                                        |

### HTTP client / harness

| ID          | Finding                                                                                                                 | Fix                                                |
| :---------- | :---------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| HTT-REV-011 | Response rebuilds in Transform/Status interceptors lose `url`/`redirected`/`type` and keep a stale `Content-Length`.    | Re-attach metadata; refresh/delete content-length. |
| HTT-REV-015 | Request-builder fidelity gaps: `Cookie` header ignored, `.body()` sets no `Content-Type`, `raw` omits the query string. | Fix builder; specs.                                |
| HTT-REV-016 | `ResponseError.formData()` bypasses the cached body buffer, breaking the documented multi-read contract.                | Use the cached buffer; spec.                       |

### Platform (Node)

| ID           | Finding                                                                                                 | Fix                                                                          |
| :----------- | :------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------------- |
| PLN-F6       | Session cookie lacks the `__Host-` pinning the CSRF cookie already uses (same class as SEC-AUD2-SEC-2). | Rename (config escape hatch); align docs.                                    |
| PLN-F7       | `Service.call` correlation-id save/restore is not concurrency-safe.                                     | Keep the id local to the call or use AsyncLocalStorage.                      |
| PLN-F9       | Dotfiles with allowlisted extensions are served; test comment claims otherwise.                         | Explicit dotfile policy (default 403, `.well-known` opt-in); pin with tests. |
| PLN-F10      | Socket registry `close()` (fanout unsubscribe) is never invoked by framework teardown.                  | Call from adapter close / make registry destroyable; lifecycle test.         |
| PLN-F8 (nit) | CORS overwrites rather than extends `Vary`.                                                             | Merge `Vary` values.                                                         |

### Dispatcher / views

| ID            | Finding                                                                                                                                                                                                 | Fix                                                                    |
| :------------ | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------------------------- |
| DSV-VIEW-3    | `AbstractCachingViewResolver` key concatenates name+language with `_` — `(user_en, US)` collides with `(user, en_US)`; wrong view served.                                                               | Unambiguous key (NUL/JSON); bound the cache.                           |
| DSV-WEBCOMP-2 | Default `IslandViewResolver` resolves every name; `IslandView` interpolates the name as a tag unvalidated.                                                                                              | Explicit viewNames default; validate custom-element name grammar.      |
| DSV-DISP-5    | `MappedHandlerInterceptor.preHandle` guard is dead and semantically wrong (matches route.path against itself as a glob).                                                                                | Delete the guard (chain construction owns filtering) or fix `matches`. |
| DSV-DUP-1     | Duplicated resolver logic across dispatcher/platform remains after HG-7 (node query/path resolvers shadow dispatcher defaults; Accept bridge ×2; negotiation predicate ×2; dead strict-browser export). | Delete shadows, consolidate helpers; wire or delete the export.        |

### Data

| ID           | Finding                                                                                                                   | Fix                                                                            |
| :----------- | :------------------------------------------------------------------------------------------------------------------------ | :----------------------------------------------------------------------------- |
| DAT-F8       | Drizzle `persist()` treats ANY INSERT failure as a possible PK-conflict upsert; can replace the original error.           | Gate on the PK-conflict signal or use `ON CONFLICT DO UPDATE`; preserve cause. |
| DAT-F9       | DrizzleTransactionManager concurrency guard check-then-act race; overlapping run fails with raw SQLITE_ERROR.             | Set active before BEGIN; serialize; spec.                                      |
| DAT-F10      | `GET /health` returns 200 with status DOWN.                                                                               | Return 503 or document always-200 prominently; pin in spec.                    |
| DAT-F11      | OpenAPI: declared `@apiDocs` responses merge with, instead of replace, the implicit 200.                                  | Replace implicit 200 when responses provided (or document); spec.              |
| DAT-F12      | OpenAPI: no security-scheme modeling — authenticated operations documented anonymous.                                     | Add `securitySchemes` + per-operation `security`; guide update.                |
| DAT-F13      | `getCachedSpec(target)` returns undefined for instances despite its JSDoc; zero tests/callers.                            | Use `getSymbolMetadata` or fix docs; spec both forms.                          |
| DAT-F14      | `[still-open]` blue-redis pub/sub and nearly all cache behavior not exercised in CI (suites env-gated; no Redis service). | Add a Redis service container and/or transport-double suite for pure logic.    |
| DAT-N1 (nit) | Substring type matching maps unrelated declared types to integer.                                                         | Closed set/word-boundary matching in both helpers.                             |
| DAT-N2 (nit) | `serializeCacheKeyStrict` keys functions by name only — collision in the “type-preserving” API.                           | WeakMap identity or documented limitation.                                     |

### Protocols

| ID          | Finding                                                                                         | Fix                                                      |
| :---------- | :---------------------------------------------------------------------------------------------- | :------------------------------------------------------- |
| PRT-REV-009 | `accept-version` uncapped before `split(',')` — pre-auth event-loop stall/heap amplification.   | Bounded identifier check before split; spec.             |
| PRT-REV-010 | Global store byte budget evicts the oldest destination's head, not the globally oldest message. | Victim by global seq/storedAt, or document policy; spec. |
| PRT-REV-011 | Broker control-path sends unguarded — raced-close transport rejects `handleSocket`.             | Single guarded control-send helper; spec.                |

### Telemetry / resilience

| ID               | Finding                                                                                                       | Fix                                                                   |
| :--------------- | :------------------------------------------------------------------------------------------------------------ | :-------------------------------------------------------------------- |
| TEL-TEL-08       | Client byte counter re-serializes every object payload (second `JSON.stringify` per send).                    | Measure the written size via client hook; drop fallback.              |
| TEL-TEL-09       | `exponentialBackoff` accepts invalid options; NaN disables backoff.                                           | Validate finite/positive options at construction; optional jitter.    |
| TEL-TEL-10       | `SpanConfig.onEnd` can leak the span and replace the method outcome; `_patchSync` never calls it.             | try/catch + `finally span.end()`; implement or document `_patchSync`. |
| TEL-TEL-11       | Span kinds mislabeled SERVER/CLIENT for internal lifecycle work; status-code attribute key/type inconsistent. | Use INTERNAL; standardize numeric `http.response.status_code`.        |
| TEL-TEL-12 (nit) | Duplicated lazy-counter caches and redundant per-subclass enable latches.                                     | Shared `createLazyCounter()` helper; single latch.                    |

### Platform (web)

| ID                | Finding                                                                                                         | Fix                                                         |
| :---------------- | :-------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| PWB-REV-009       | IndexedDB loader has no connection lifecycle (no `versionchange`/`blocked`, no close/dispose).                  | Handle versionchange/blocked; idempotent `close()`.         |
| PWB-REV-010       | `HostManager.registerFeature` not atomic: routing-registry rejection leaves an orphaned mount registration.     | Register routing first or roll back; duplicate-prefix spec. |
| PWB-REV-013       | `Cookies.remove` mutates the caller's attribute object; `getJSON` throws on present non-JSON values.            | Fresh removal attrs; parse guard; specs.                    |
| PWB-REV-014       | Accept-Language negotiation ignores q-values (and `*`/`q=0`).                                                   | Parse/sort q-values; document if deliberate.                |
| PWB-REV-015       | Router errors swallowed or escape the boolean contract; `afterCompletion` failures become unhandled rejections. | Error hook/logger + `.catch` in hashchange/popstate; specs. |
| PWB-REV-016       | `RouteDefinition.parse` returns a route whose params are never bound.                                           | Call `resolveParams`; spec.                                 |
| PWB-REV-017       | `TtlContentSource` retains expired entries indefinitely (unbounded for dynamic keys).                           | Sweep on write / bound with LRU; document.                  |
| PWB-REV-018 (nit) | Hash/Browser routers duplicate transaction/enums/interceptor machinery; rollback semantics already drifted.     | Extract shared abstract router + parity spec.               |

### Auth / security

| ID             | Finding                                                                                                                 | Fix                                                                          |
| :------------- | :---------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------- |
| SEC-AUD2-SEC-4 | Empty-string `passwordHash` escapes the one-generic-denial contract as `UnknownPasswordSchemeError` (500-class oracle). | Same normalization as SEC-B1; map to generic denial.                         |
| SEC-AUD2-SEC-5 | OIDC ID tokens without `sub` authenticate as a shared `'unknown'` principal.                                            | Require non-empty `sub` in `#assertClaims`; delete fallback.                 |
| SEC-AUD2-SEC-6 | `principal.roles` (String-coerced) disagrees with `hasRole`/`hasAnyRole` (raw includes) for non-string claims.          | Normalize once; align adapters; spec.                                        |
| SEC-AUD2-SEC-7 | `@blue/platform-web` cookie jar defaults emit no SameSite/Secure.                                                       | Default `{path:'/', sameSite:'Lax', secure:true}` (overridable) or document. |

### Tooling / CI

| ID            | Finding                                                                          | Fix                                                          |
| :------------ | :------------------------------------------------------------------------------- | :----------------------------------------------------------- |
| TOL-F7        | Dead script `scripts/typedoc-plugin-sig.js` unreferenced and broken under ESM.   | Delete or port to ESM + register.                            |
| TOL-F8        | `.npmrc` has three stale/misleading settings.                                    | Remove pass-through-args/hoist lines; fix overrides comment. |
| TOL-F9        | Root `debug` devDependency is dead but masked by the manifest checker allowlist. | Remove dep + allowlist line.                                 |
| TOL-F10       | CI uploads a Playwright HTML report that is never generated.                     | Add html reporter or drop the upload.                        |
| TOL-F11       | Benchmark harness reports success when no results were produced.                 | Exit non-zero on timeout without results.                    |
| TOL-F12 (nit) | Decision-doc line citations for the lint gate have drifted.                      | Cite by rule name.                                           |
| TOL-F13 (nit) | CI installs graft unpinned and builds a shallow graph.                           | Pin version; match local flags.                              |

### Apps

| ID            | Finding                                                                                             | Fix                                                             |
| :------------ | :-------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| APP-N9        | Dead demo leftovers (placeholder spec, dead auth CSS/exports, unfilled `learn.json`, `STATIC_DIR`). | Delete or implement; fix comment.                               |
| APP-N10       | `apps/README` build instructions fail for the node apps; blue-hello/blue-hello-node have no tests.  | Qualify per app type; add smoke tests or state omission.        |
| APP-N11       | Synchronous `requestAnimationFrame` mock copy-pasted in five specs.                                 | Export `installSynchronousAnimationFrames()` from `@blue/test`. |
| APP-N12       | blue-todo auth nav interpolates identity into `innerHTML` (untested, copyable XSS pattern).         | Build nodes with `textContent`; nav-state spec.                 |
| APP-N13 (nit) | blue-host/blue-views demo polish (status not cleared, shared cart unused, missing nav links).       | Minor UI fixes.                                                 |

### Documentation

| ID           | Finding                                                                                                                     | Fix                                                  |
| :----------- | :-------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------- |
| DOC-04       | Package Map external-dependency parentheses incomplete (contract says “externals in parentheses”).                          | Backfill or relax the header.                        |
| DOC-06       | STYLE_GUIDE filename rule omits the living-doc stable-slug convention.                                                      | Add third pattern; cross-link docs/README.           |
| DOC-07       | `[still-open]` ARCHITECTURE still credits “functional composition (via Ramda)” (AD-57 removed it).                          | Drop “(via Ramda)”.                                  |
| DOC-08       | Integration-layer table stale vs `@blue/util` manifest and the enforcement map (ramda/date-fns listed; safe-regex missing). | Update table + `INTEGRATION_LAYER_MAP`.              |
| DOC-09       | README and AGENTS “Dividing Line” tables out of sync despite the maintenance note.                                          | Port the Decorators row.                             |
| DOC-10       | STYLE_GUIDE “See:” points at a nonexistent plan path (uncatchable by the link gate — inline code span).                     | Fix path.                                            |
| DOC-13       | `apps/README` generic build command fails for 3 of 7 apps.                                                                  | State per-type commands.                             |
| DOC-14       | Guides gap: `@blue/test` harness (AD-63) and the HTTP client stack have no how-to.                                          | Add a testing guide + HTTP client guide; index them. |
| DOC-11 (nit) | Archived reference lacks the index ARCHIVED marker.                                                                         | Add marker/banner.                                   |

## 5. Feature-inventory reconciliation (INV findings, 10)

The inventory slice reconciled all 21 gap rows of
`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` against HEAD: **18 IMPLEMENTED**
(3 with sub-deferrals: scheduling→AD-41, sessions→Redis adapter consumer-gated,
config→D-9 follow-up), **1 PARTIAL** (Content/i18n), **2 DEFERRED unchanged**
(broker/outbox; Tier-3 set: multi-tenancy, queues, testcontainers, feature flags, gRPC).
Verified-clean themes: validation placement (AD-52 superseded by AD-07 as documented),
observability (AD-32/AD-36 hold), distributed concerns (AD-40 Phases 1-3 hold with
documented limits).

| ID          | Finding                                                                                                                                                                                                                                                               | Fix                                                                                                                                                              |
| :---------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| INV-1       | Content/i18n blanket “IMPLEMENTED” overstates the landed surface: RTL never adopted (no ADR), the D4 localStorage half landed cookie-only, `@locale` injection is an AD-19 D6 non-goal, ICU backend absent; contract is async (AD-39) while samples show sync shapes. | Split the status per item; record RTL/localStorage as explicit deferrals (or implement); annotate D6; fix naming drift (`LocaleResolver` vs `LanguageResolver`). |
| INV-2       | §5 “persistent backends deferred” contradicts §2.2 (LibSQL sessions shipped 2026-10-01, AD-40 P1).                                                                                                                                                                    | Update the sequencing cell.                                                                                                                                      |
| INV-3       | §4.1 “Current state (verified)” still describes pre-AD-19 behavior (view-name resolution only) though wiring shipped.                                                                                                                                                 | Retitle historical or update.                                                                                                                                    |
| INV-4       | References line still says ADRs `(3, 7–20, 24, 26–29)`; doc rows already cite AD-30..AD-68.                                                                                                                                                                           | Update to the ADR index pointer.                                                                                                                                 |
| INV-5       | §1 feature inventory lacks rows for `@blue/log` (AD-67), `@blue/proxy`/`@blue/resilience` (AD-42/43), `@blue/redis` (AD-40), TOON (AD-66).                                                                                                                            | Refresh or point at ARCHITECTURE §Package Map.                                                                                                                   |
| INV-6       | §2.2 session row points at the wrong roadmap phase for the Redis session adapter (“Phase 2 family”).                                                                                                                                                                  | Retarget to roadmap Phase 5 / AD-40 (consumer-gated).                                                                                                            |
| INV-7 (nit) | §2.2 broker wording “in-process EventEmitter only” ignores Redis fan-out + durable `/queue` store.                                                                                                                                                                    | Rephrase.                                                                                                                                                        |
| INV-8 (nit) | §2.1 scheduling row lacks the AD-41 distributed-deferral qualifier.                                                                                                                                                                                                   | Append it.                                                                                                                                                       |
| INV-9 (nit) | §3 Telemetry row has a malformed markdown table (unescaped pipes).                                                                                                                                                                                                    | Escape pipes.                                                                                                                                                    |
| INV-10      | §3 Auth row predates AD-68 user-wide revocation.                                                                                                                                                                                                                      | Add AD-68.                                                                                                                                                       |

Also recorded (additions since the audit, uncatalogued in its rows): AD-39 async-by-default,
AD-42/43 interception/resilience, AD-66 TOON, AD-67 `@blue/log`, AD-68 revocation, AD-34
TypeScript-native layer.

---

## 6. Framework gaps vs. comparable frameworks (GAP findings, 13 + 2 watch)

External comparison against Spring Boot (+Modulith/Cloud), NestJS, Fastify, AdonisJS, Hono,
Astro, Next.js, Encore and Effect, with primary-source citations in the slice report. The
comparison also corrected the review brief: validation, RFC 9457 problem details, graceful
shutdown, migrations-apply, security interceptors and OpenAPI already exist and are
competitive — the gaps are the **distributed/runtime-scaling axis** and the **ops/DX
surface**.

| Rank | Gap                                                                                                                                                                                                                     | Severity | Effort | Proposed decision                                                                                                                                                                                                                     |
| :--- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------- | :----- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1    | No durable jobs/queues and no transactional outbox (events are in-process; STOMP store is not a job substrate). Peers: Spring Modulith Event Publication Registry, Nest `@nestjs/bullmq`, Encore pub/sub, Adonis queue. | high     | L      | **Accept for 1.0**: new ADR + `@blue/jobs` (decorator processors, driver SPI over Redis/SQL, retries/DLQ, delayed+repeatable) and outbox-style publish-after-commit wired into the ORM unit-of-work.                                  |
| 2    | Single-process runtime: no clustering/multi-core, no worker offload; per-process rate limiting compounds it. Peers: `node:cluster`, PM2, Spring/Tomcat thread-pool expectation.                                         | high     | M      | **Accept**: `blue serve --cluster <n>` supervisor fanning SIGTERM into the existing graceful shutdown; `@blue/worker` pool helper; publish a shared-state matrix (sessions/cache/limits/scheduler under N processes).                 |
| 3    | Cron single-node only; no distributed locks/leader election/persistent schedules (AD-41 defers it). Peers: Quartz clustering, ShedLock, BullMQ schedulers, PG advisory locks.                                           | high     | M      | **Accept**: `@blue/locks` (Redis + PG advisory drivers, fencing tokens) + optional scheduler driver acquiring a lock per run; `@scheduled({lock})`; revisit AD-41 triggers.                                                           |
| 4    | Management surface only `/health` + `/metrics` — no `/loggers`, `/env` (redacted), `/configprops`, `/info`, health groups for k8s probes. Peers: Spring Boot Actuator.                                                  | high     | S      | **Accept**: extend `blue-management` using the existing management-path access guard and `@blue/log` runtime levels.                                                                                                                  |
| 5    | Metrics are a proprietary JSON snapshot; traces are OTel but metrics are not — no OTLP/Prometheus export, no semconv names. Peers: Micrometer + OTLP/Prometheus registries; OTel HTTP semconv.                          | high     | M      | **Accept**: emit real OTel metrics (semconv names, `http.server.request.duration`) with OTLP + Prometheus exporter options; keep the JSON view derived from the MeterProvider.                                                        |
| 6    | No first-class CLI/dev loop: no watch/restart/HMR, app-facing commands, or packaging. Peers: Nest CLI, Adonis Ace (`serve --watch`/HMR), Spring DevTools, Encore CLI, Boot buildpacks.                                  | high     | M      | **Accept**: `@blue/cli` — `blue dev` (supervised restart; later metadata-aware reload), `blue generate` (promote Nx generators), `blue db`, `blue worker`, `blue build` (layered OCI/Dockerfile).                                     |
| 7    | Migrations apply but are not generated from decorator entities and not wired into boot. Peers: drizzle-kit, Lucid, Flyway/Liquibase auto-config.                                                                        | medium   | M      | **Accept**: `blue db generate` (entity metadata → schema diff + snapshot) so decorator entities are the single schema source; `migrations.runOnBoot`.                                                                                 |
| 8    | Rate limiting is per-process in-memory and keys on `remoteAddress` only; behind a LB every client may look like the proxy. Peers: `@fastify/rate-limit` pluggable stores, `@nestjs/throttler` storage.                  | medium   | S      | **Accept**: Redis fixed/sliding-window driver via the existing `RateLimiter` SPI + trusted-proxy client identity; document per-process default until then.                                                                            |
| 9    | Testing lacks containerized dependencies and DB isolation/fixtures (MockHTTP covers in-process only). Peers: Spring Testcontainers `@ServiceConnection`, Adonis Japa, Nest testing module.                              | medium   | M      | **Accept**: `@blue/test-containers` glue (declare containers → register connection properties; migrate once; transactional rollback).                                                                                                 |
| 10   | No API versioning, OpenAPI 3.1, typed-client codegen, or AsyncAPI for sockets. Peers: Spring 6.2 versioning, Nest versioning + CLI plugin, Hono/Fastify swagger, OAS 3.1.                                               | medium   | M      | **Defer with ADR**: versioning resolvers in `@requestMapping`, spec 3.1, client codegen, AsyncAPI 3 for `@socketMapping`/`@stompMapping`.                                                                                             |
| 11   | Browser paradigm under-delivers: buffered EJS rendering, no streaming-HTML/form-action story, no official Vite integration. Peers: React/Next streaming SSR, Server Actions, Astro islands/actions, Adonis Vite.        | medium   | L      | **Defer with ADR**: async-iterable view contract (SSE plumbing already models streaming), `@blue/vite` integration, form-action helper reusing Zod + problem-details; document web-component islands as the partial-hydration answer. |
| 12   | No multitenancy primitives (tenant context, scoped datasource/cache/locks/telemetry). Peer: Hibernate multi-tenancy strategies.                                                                                         | medium   | L      | **Defer**: define tenant-context token + resolution hook design in an ADR; implement when a design partner needs it, else record out-of-scope.                                                                                        |
| 13   | No feature-flag abstraction. Peer: OpenFeature spec.                                                                                                                                                                    | low      | S      | **Defer**: `FlagEvaluator` SPI with an OpenFeature-compatible provider, local provider backed by the existing property sources/refresh.                                                                                               |
| W1   | Edge/serverless portability (Web-standard adapter).                                                                                                                                                                     | low      | L      | **Watch**: acceptable for the Spring-for-TS positioning; introduce a Fetch-API server adapter only if a target demands it.                                                                                                            |
| W2   | HTTP/3 (upstream Node/undici gap).                                                                                                                                                                                      | low      | L      | **Watch**: document H2 termination at the edge as the supported pattern.                                                                                                                                                              |

Sequencing recommendation: gaps 1–3 are one dependency cluster (locks → scheduler/jobs →
cluster), 4–5 reuse existing management/telemetry plumbing, 6–7 are the DX track. Do not
start 10–13 before the 1.0 blockers land; record each deferral as an ADR so the “why not”
is discoverable.

## 7. Verified good / no action, and the still-open register

**No regressions found** in the re-checked first-sweep fixes: `pnpm build` acyclicity,
B-1/A-1 cycles, CF-1 conditional gating (named paths), CF-3 refresh teardown, IN-1/IN-2,
HT-1 cache-credential gate, PL-1/PL-3/PL-4/PL-7/PL-12, A-4 negotiation holder, SE-1..SE-12
incl. AD-68, OP-2/OP-3/OP-5/OP-6/OP-7/OP-8/OP-9/OP-10/OP-14, DA-1 type mapping, OpenAPI
PR-2/PR-9/PR-11, TO-1's named-export fix, DO-3/DO-4/DO-6 index repairs, AP-1/AP-3/AP-4/AP-8/
AP-9/AP-11. Verified-strong areas: SQL identifier safety (metadata-only, double-quoted),
trusted-proxy resolution, WebSocket upgrade bounds, multipart cleanup/traversal,
AES-GCM secret cipher, security headers, shutdown drain, STOMP frame codec round-trips,
radix precedence (static>param, greedy fallback), island serializer escaping for the
framework's own encoding, auth fail-closed guards, session-store rotation/TTL, OIDC
state/nonce/PKCE/HTTPS enforcement, CSRF timing-safe compare.

**Still-open / regression register (recurrence risk):**

| Item                                                                    | Why it recurs                                                                                              | Mitigation to add                                                                                                                                                   |
| :---------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Secret redaction (CTX-CTX-02/03; CF-2 family)                           | Redaction was fixed per-site, not as an invariant; each new wrap point leaks again.                        | One redaction helper used by every error wrap that can contain a property value + a secrets-field-mode spec matrix (resolver, binding, env validation, converters). |
| `@blue/log` adoption (KRN-REV-LOG-11; OP-8)                             | Module-load loggers cannot follow `LoggerFactory` switches; ~20 framework sites still use raw `console.*`. | Lazy handles (or reconfiguration) + migrate framework `console.warn/error` call sites to `@blue/log`.                                                               |
| AD-46 internal files (TOL-F2; TO-1 family)                              | The rule only inspects `src/index.ts`; sub-barrels leak internals.                                         | Extend `isPublicIndexFile` to `src/**/index.ts` (or reachable-from-exports) + fixture; promote `_registry.ts`.                                                      |
| Stale AD maxima (DOC-01; DO-3/DO-6 family)                              | Hand-maintained ranges in three index docs.                                                                | Generate the range (or drop it) as part of the ADR index script; add to review checklist.                                                                           |
| Test-vs-real parity (HTT-REV-012..014, PLN-F2/F3, DAT-F14, APP-N5)      | Suites use doubles that cannot reproduce abort/case/limit behavior; env-gated suites never run.            | MockHTTP↔adapter parity specs; real-`ServerResponse` abort tests; Redis service container; clean-checkout app builds in CI.                                         |
| “Claimed fixed but incomplete” (DAT-F1, KRN-REV-LOG-11, TOL-F2, DOC-01) | Remediation lacked a fail-before regression test in the same wave.                                         | Wave exit criterion: every fix lands with a test that fails on the pre-fix revision.                                                                                |

---

## 8. Mitigation plan

Ordering rule: security and availability blockers first, then correctness highs, then the
medium/low backlog, then product gaps. Every wave ends with the full gate set (§9) plus the
wave's regression tests. Item IDs refer to the tables above.

### Wave 1 — Security hotfix (P0)

| Items                   | Change                                                                                                                                              | Regression test                                                                                                             |
| :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------- |
| SEC-B1                  | Dummy hash becomes a timing sink only; reject `null`/`undefined`/`''` hashes.                                                                       | Dummy constant vs null/undefined/'' hashes rejected; valid login still works (the removed integrator probe becomes a spec). |
| DSV-SEC-1               | Reject `..`/separator segments in view names; canonicalize + contain against the resolver root; containment re-check in `FileSystemResourceLoader`. | E2E: `/..;x=1/..;x=1/tmp/x` → 400/404, never file content; loader-level join spec.                                          |
| PLN-F1                  | realpath + `base + sep` containment for `.br`/`.gz` variants (or refuse symlinked variants).                                                        | `.br`/`.gz` symlink escape test mirroring the `escape.lnk` case.                                                            |
| SEC-AUD2-SEC-2 / PLN-F6 | Session cookie → `__Host-blue-session` (config escape hatch for migrations); duplicate security-cookie names rejected.                              | Duplicate-cookie parse spec; cookie-name/attribute spec.                                                                    |
| SEC-AUD2-SEC-3          | Correct guide 11 / security.md; enforce JSON content-type on login (or wire CSRF by default for cookie-session apps).                               | Form-encoded login → 415 (or CSRF-forced failure); doc claim updated.                                                       |
| SEC-AUD2-SEC-4..7       | Hash normalization reuse; OIDC `sub` required; roles normalized once; web cookie-jar defaults SameSite=Lax + Secure.                                | One spec per item.                                                                                                          |

### Wave 2 — Availability and CI blockers

| Items     | Change                                                                                                 | Regression test                                                                                |
| :-------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------- |
| TEL-B1    | Defensive request-target parse; attributes-callback try/catch in `AbstractBaseInstrumentation._patch`. | Raw `GET http://[ HTTP/1.1` against a listening telemetry-enabled adapter stays alive.         |
| DSV-B1    | Finalize 500 (or rethrow) when dispatch returns with an open response.                                 | Handler → throwing view render → terminal 500 within timeout.                                  |
| PLN-F2/F3 | Race `drain` with `close`; destroy streams/iterators in `finally`.                                     | Real-`ServerResponse` abort tests for static and streaming paths (fd closed, handler settles). |
| PLN-F5    | Treat `headersSent` like ended; per-interceptor `completeHandle` isolation; `.catch` backstop.         | Post-headers error no longer produces an unhandled rejection.                                  |
| PLN-F4    | Destroy the response on mid-stream failure after headers.                                              | SSE producer error → connection ends, no hang.                                                 |
| CI-B1     | Build libraries in the e2e job (or nx `dependsOn`).                                                    | CI lane green on a fresh checkout (simulate with `git archive`).                               |
| APP-B1    | Root-relative `AccountController` (or full-path dispatch in `onRoute`).                                | Shell-router specs render `account-app` for `#/account` and `#/account/settings`.              |

### Wave 3 — Correctness highs and the context/kernel clusters

| Items                               | Change                                                                                                                                                                                                                            |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| KRN-REV-RADIX-01 / DSV-DISP-2/3     | Registration model: one registration per (kind,label); reject conflicting shapes; exact-pattern delete.                                                                                                                           |
| KRN-REV-CORE-02 / KRN-REV-BINDER-05 | Growable `MutablePropertyValues`; name-based required-field validation.                                                                                                                                                           |
| KRN-REV-DOM-03                      | Fragment normalization + cross-provider parity suite.                                                                                                                                                                             |
| KRN mediums                         | URL-glob ReDoS guard, media-type suffix/intern/wildcard fixes, wildcard escaping, `@reactive` cleanup, factory scopes, logger handles.                                                                                            |
| CTX-CTX-01..11                      | Relaxed-binding winning-key fix; secret redaction helper + env/converter specs; marker fail-open; close/teardown exception safety; source naming; route-scan gating; single-flight `run()`; String converter; untyped-field docs. |
| HTT-REV-001..012                    | Stable retry identity; postResponse on cache hits; clone-based ResponseType; refuse credentialed caching; MockHTTP↔adapter error/limit parity.                                                                                    |
| DAT-F1                              | Shared lifecycle runner + parity spec.                                                                                                                                                                                            |
| PRT-REV-001/002                     | Exception-safe STOMP send/flush; header-octet accounting.                                                                                                                                                                         |
| TEL-TEL-02/03                       | Breaker cell in-place mutation + probe latch + epoch guard; direct `@counted` wrapper.                                                                                                                                            |
| PWB-REV-001                         | Guard `document` in the cookie jar; lazy `currentLocale`; Node import specs for `@blue/platform-web` and `@blue/telemetry-web`.                                                                                                   |
| DSV-WEBCOMP-1                       | Shared island encode/decode helper + hydration spec.                                                                                                                                                                              |

### Wave 4 — Medium/low backlog by area

| Area             | Items                                                                           | Notes                                                                                                                                                                                                                          |
| :--------------- | :------------------------------------------------------------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Platform-node    | PLN-F4 (wave 2), F7, F9, F10, F8                                                | Correlation-id safety, dotfile policy, registry teardown, Vary merge.                                                                                                                                                          |
| Dispatcher/views | DSV-DISP-2/3/4/5, VIEW-1/2/3, EJS-1, WEBCOMP-2, DUP-1                           | 406 semantics, request-copy negotiation, error-map hierarchy, EJS filename/includes, cache keys, island defaults, resolver dedup.                                                                                              |
| Data             | DAT-F2..F14, N1, N2                                                             | Transaction overlap guard, generated columns, Date mapping, N+1 batching, scheduler latch, snapshot limits, health 503, OpenAPI responses/security, Redis CI lane.                                                             |
| Protocols        | PRT-REV-003..011                                                                | CONNECT escaping, message-id indexing, /user unsubscribe binding, serialization faults, SSE parser, terminal subscribe, identifier caps, eviction policy, guarded control sends.                                               |
| Telemetry        | TEL-TEL-04..12                                                                  | Browser log gate, idempotent configure + flush on unload, semconv attributes, fan-out counter semantics, span lifecycle, shared counter cache.                                                                                 |
| Platform-web     | PWB-REV-002..018                                                                | Router rollback/echo/concurrency, offline replay, IndexedDB lifecycle, host atomicity, activation policy, cookies, q-values, error surfacing, TTL sweep, router dedup.                                                         |
| Kernel lows/nits | KRN-REV-FACTORY-13/14, GLOB-15, SERIAL-16, PROXY-17, MEDIA-18, RING-19, UTIL-20 | Cleanups; no behavior risk beyond the listed defects.                                                                                                                                                                          |
| Context lows     | CTX-CTX-12/13/14                                                                | Precedence, refresh destroy, TSDoc.                                                                                                                                                                                            |
| HTTP lows        | HTT-REV-011/015/016                                                             | Response metadata, builder fidelity, cached-body reads.                                                                                                                                                                        |
| Apps             | APP-N2..N13                                                                     | Auth guard normalization + login/profile pages (or removal), island SSE snapshot-on-connect, host test script, island prebuild, gateway metrics, manifest gate coverage, READMEs, dead leftovers, rAF helper, nav XSS pattern. |

### Wave 5 — Tooling, docs, hygiene, and cross-cutting gates

| Items         | Change                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TOL-F3..F13   | Generator alias fix; coverage lane decision; test-file typecheck lane; vitest alias repair + existence check; dead script/dep/report/benchmark fixes; pinned graft.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| DOC-01..14    | AD-range fix/generation; ARCHITECTURE package map + peer table + Ramda line; STYLE_GUIDE enforcement markers + filename rule + dead path; README/AGENTS sync; apps README; testing + HTTP-client guides; archived marker.                                                                                                                                                                                                                                                                                                                                                                              |
| INV-1..10     | Refresh or demote the gap analysis; per-item status split for Content/i18n; correct stale rows/pointers/table.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Cross-cutting | Migrate framework `console.*` call sites (~20 across `blue-cache`, `blue-context`, `blue-signals`, `blue-scheduler`, `blue-proxy`, `blue-dispatcher`, `blue-platform-*`, `blue-util` where a leaf is allowed) to `@blue/log`; decide skipped-test backlog policy (`apps/blue-todo/test/placeholder.spec.ts`, 8 `test.skip` query-string parity cases, dispatcher `describe.skip` integration stub) — implement or delete with a documented limitation; export `installSynchronousAnimationFrames()` (APP-N11); stale `vitest.config.ts` aliases (`@blue/logger`, `@blue/auth`, `@blue/eslint-plugin`). |

### Wave 6 — Product roadmap (framework gaps)

- **Accept for 1.0** (new ADRs first): GAP-1 jobs/outbox, GAP-2 cluster/worker, GAP-3 distributed locks + scheduler persistence, GAP-4 actuator parity, GAP-5 OTel metrics + OTLP/Prometheus, GAP-6 CLI/dev loop, GAP-7 migration generation + run-on-boot, GAP-8 shared-store rate limiting, GAP-9 testcontainers/DB isolation.
- **Defer with recorded decisions**: GAP-10 versioning/OpenAPI 3.1/codegen/AsyncAPI, GAP-11 streaming views/Vite/form actions, GAP-12 multitenancy, GAP-13 feature flags, W1 edge portability, W2 HTTP/3.
- Suggested order: GAP-3 → GAP-1 → GAP-2 (dependency cluster); GAP-4/5 (reuse existing plumbing) in parallel; GAP-6/7 DX track; deferrals get ADRs only (no code) until a consumer exists.

### Wave 7 — Verification

Per-wave: fail-before/pass-after test for every block/high item; then the full gate set
(§9). Wave 7 closes with the complete CI lane run plus the new gates below, and a clean
`git status`.

### Gate and process additions (prevent recurrence)

1. e2e job builds workspace libraries before the app (CI-B1) and CI gains a fresh-checkout build simulation.
2. Test-file typecheck lane (`tsconfig.spec.json` per package/app or `vitest --typecheck`) — TOL-F5.
3. Vitest alias-target existence check wired into `scripts/check-manifests.mjs` — TOL-F6.
4. AD-range generation (or removal of hard maxima) — DOC-01.
5. Coverage lane either enforced with `include` + thresholds or the dead block deleted — TOL-F4.
6. `no-internal-file-exports` extended to `src/**/index.ts` + fixture — TOL-F2.
7. Secret-redaction invariant helper + spec matrix (resolver/binding/env-validation/converters) — CTX-CTX-02/03.
8. MockHTTP↔adapter parity suite for error mapping, limits, multipart case, aborts — HTT-REV-012..014.
9. Non-DOM import smoke test for browser barrels (`@blue/platform-web`, `@blue/telemetry-web`) — PWB-REV-001.
10. Redis service container in CI for the env-gated suites — DAT-F14.
11. Review-checklist addition: run `pnpm build` (already), plus fresh-checkout e2e, non-DOM import, abort-path, and fail-before regression checks; re-verify “live” docs against HEAD when they are used as references.

---

## 9. Verification protocol

```bash
# Full gate set (all must pass; doc lane is the long pole ~3 min)
pnpm build && pnpm test && pnpm lint && pnpm format:check && pnpm docs:links \
  && pnpm audit --prod && pnpm manifest:check && pnpm agents:check \
  && pnpm typecheck && pnpm doc && git diff --exit-code -- packages doc

# Wave-specific probes (throwaway; never committed)
#  auth:      InMemoryUserStore passwordHash null + dummy constant -> must reject
#  telemetry: raw socket `GET http://[ HTTP/1.1` with instrumentation -> process survives
#  dispatcher: view.render throws -> terminal 500, no hang
#  radix:     insert '/b/:foo' then '/b/:bar' -> params/pattern must agree or insert must reject
#  e2e:       git archive HEAD | tar -x -C /tmp/x && pnpm install && pnpm --filter @blue/todo build
```

Acceptance for closure: every block/high item has a fail-before/pass-after test; all
medium items either fixed or explicitly deferred with a reason in this file; gates green;
`graft build` refreshed after the code waves.

---

## Appendix A — Review slices and probe artifacts

| Slice            | Agent                   | Key probe artifacts (throwaway, /tmp)                                                                 |
| :--------------- | :---------------------- | :---------------------------------------------------------------------------------------------------- |
| Kernel           | KernelReview-2          | `/tmp/bprobe/*` (radix, property-values, DOM, media, glob, factory)                                   |
| Context/Boot     | ContextBootReview-2     | `/tmp/blue-review/probes.spec.ts` (20 probes, 19 failing = reproductions)                             |
| HTTP/harness     | HttpClientReview-2      | `/tmp/blue-probe/*` (pipeline, retry×auth, cache-sec, MockHTTP)                                       |
| Platform-node    | PlatformNodeReview-2    | `/tmp/omp-review/*` (static variant, drain/fd, writer abort, SSE, adapter crash, multipart, dotfiles) |
| Dispatcher/views | DispatcherViewsReview-2 | `/tmp/*-probe.mjs` (traversal e2e, hang, radix, negotiation, cache key, EJS)                          |
| Data             | DataLayerReview-2       | `/tmp/ormprobe/*`, `/tmp/oaprobe/*`, `/tmp/schedprobe.mts`                                            |
| Protocols        | ProtocolsReview-2       | `/tmp/probes/probe1..11` (STOMP, budgets, SSE)                                                        |
| Telemetry        | TelemetryReview-2       | `/tmp/probe-real-crash2.mts`, `/tmp/probe-cb*.mts`, `/tmp/probe-counted.mts`                          |
| Platform-web     | PlatformWebReview-2     | `/tmp/bluereview/*` (10 jsdom/Node probes)                                                            |
| Auth/security    | AuthSecurityReview-2    | `/tmp/blue-sec/*` (nohash, login-csrf, jwt-roles, inherit, method casing)                             |
| Tooling          | ToolingReview-3         | clean-checkout CI simulation, alias-target loop, generator escaping                                   |
| Apps             | AppsReview-3            | app test/build runs + `/tmp` routing/SSE probes                                                       |
| Docs             | DocsReview-3            | index/table/manifest diffs, link checker                                                              |
| Inventory        | FeatureInventory-2      | gap-row reconciliation (21 rows)                                                                      |
| Industry         | IndustryGaps-2          | peer primary sources (Spring/Nest/Fastify/Adonis/Hono/Astro/Next/Encore/Effect)                       |
| Gates            | QualityGates-2          | full CI lane run (11 entries, 265.6 s)                                                                |

## Appendix B — Finding counts

| Class                                  | Count                                                               |
| :------------------------------------- | :------------------------------------------------------------------ |
| Block                                  | 5                                                                   |
| High                                   | 28                                                                  |
| Medium                                 | 71                                                                  |
| Low                                    | 63                                                                  |
| Nit                                    | 12                                                                  |
| **Subtotal (code/security/apps/docs)** | **179** (14 of them documentation findings: 5 medium, 8 low, 1 nit) |
| Inventory reconciliation (additional)  | 10 (2 medium, 4 low, 4 nit)                                         |
| Framework gaps                         | 13 + 2 watch items                                                  |
| Verified-clean prior fixes             | all re-checked items (see §7)                                       |
