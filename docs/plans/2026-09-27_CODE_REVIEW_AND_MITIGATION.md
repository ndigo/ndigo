# Code Review & Remediation Plan — AD-30 (ORM migrations) + AD-31 (relation fetch) + AD-32 (telemetry completion) + AD-33 (auth completion) wave

**Date:** 2026-09-27
**Scope:** The uncommitted AD-30..33 wave on top of `82b73ad5` (HEAD): 35 modified files (+1238/−283) and 46 untracked files across `blue-orm`, `blue-orm-drizzle`, `blue-telemetry`, `blue-telemetry-node`, `blue-signals`, `blue-auth-core`, `blue-auth-server`, `blue-platform-node`, `blue-test`, `blue-management`, `apps/blue-api`, plus ADRs, guides 10/11, and the AUTH/ORM/TELEMETRY completion plans. Prior waves (AD-24..29) were reviewed and remediated on 09-18/09-25; their remediations were spot-verified at HEAD (SEC-4 gate, SEC-5 413 cap, SEC-6 cleanup, DSG-5 `HTTPHeader`) and are out of scope except where this wave regresses them.

**Method:** Repository gates executed ([exec]): `pnpm lint` ❌, `pnpm format:check` ❌ (61 files), `pnpm build` ✅ 33/33, affected test suites ✅ (blue-auth-core, blue-auth-server, blue-orm, blue-orm-drizzle, blue-telemetry, blue-telemetry-node, blue-signals, blue-platform-node, blue-management, blue-test, blue-api 61 tests). Security/crypto/reuse axes reviewed line-by-line on the working tree ([code] citations below). Prior-wave remediation claims re-verified at HEAD via `git grep` (SEC-4/SEC-5/SEC-6/DSG-5 all present).

**Status:** Findings recorded 2026-09-27; **remediation executed the same day** — Waves 1–4 below (gates, security, reuse/hygiene, decisions/docs), plus the user-directed `mockMVC` → `mockHTTP` variable rename (harness lost its `-MVC` naming across 12 files + 3 docs). Repository gates green: `pnpm lint` exit 0, `pnpm format:check` exit 0 (1409 files), `pnpm build` 33/33, affected suites re-run green.

## 1. Verified baseline (healthy — do not "fix")

| Item                | Evidence                                                                                                                                                                                                                                                                 | Result |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ |
| Test suites         | 11 affected suites run, exit 0 (incl. apps/blue-api 61 tests; cookie-session round trip, rate-limit 429, rotation/fixation, CSRF-when-wired covered in `auth.spec.ts`)                                                                                                   | ✅     |
| Build               | `pnpm build` 33/33, exit 0                                                                                                                                                                                                                                               | ✅     |
| Session tokens      | 32-byte `randomBytes` ids (`in-memory-session-store.ts:37`), fixation-safe rotation (old id deleted before new issued, `:47-57`)                                                                                                                                         | ✅     |
| scrypt posture      | `timingSafeEqual` verify, per-user 16-byte salt, self-describing PHC-style format, malformed → throws not silent false (`scrypt-password-encoder.ts`)                                                                                                                    | ✅     |
| Timing equalization | dummy-hash verify on unknown usernames (`credentials-auth-adapter.ts:118-128`) — no error-text user enumeration (`InvalidCredentialsError` is one generic denial)                                                                                                        | ✅     |
| Rate limiting       | Fixed-window, keys on socket `remoteAddress`, XFF deliberately not trusted and documented (`node-request.ts:28-35`, `rate-limit-interceptor.ts:52-61`); bounded map with opportunistic sweep; mock harness gets per-test fresh peer addresses (`request-builder.ts:118`) | ✅     |
| Sampler config      | ratio validated NaN/[0,1] (`node-config.ts:111-114`), presets → `ParentBasedSampler`; validate-before-latch + loud re-configure warning (`:124-140`)                                                                                                                     | ✅     |
| Migrator design     | parameterized journal inserts, validated/sorted versions, idempotent re-run, DDL transaction limits documented (`drizzle-migrator.ts`) — D-2 accepted tradeoffs                                                                                                          | ✅     |
| Header reads        | `HTTPHeader` case-folded reads intact (`header-argument-resolver.ts:33-35`); cookie reads via `NodeRequest.cookies` (`parseCookies` caps); CSRF via `HTTPHeaders.X_CSRF_TOKEN`; no hand-rolled parsing introduced                                                        | ✅     |
| Derived queries     | property names allowlisted against declared columns (`parseDerivedQuery`); values parameterized (`drizzle-entity-manager.ts` `findAllWhere` `= ?` binding)                                                                                                               | ✅     |
| DDL reuse           | `createTableStatements` extracted as single metadata→DDL source shared by `init` and baseline migrations (AD-30 D-3)                                                                                                                                                     | ✅     |

## 2. Findings

### 2.1 Blocks — repository gates

**B1 (Block) — `pnpm format:check` fails on 61 files; every new wave file is affected.**
[exec] All ~50 new source/test/doc files and several modified files lack a trailing newline (`apps/blue-api/src/auth-controller.ts`, `auth-store.ts`, `derived-query-repository.ts`, `node-config.ts`, …); the gate reports 61 files. Identical failure mode to the 09-25 wave's B1, whose mitigation ("format:check as a wave-checklist step") was not applied.
**Mitigation:** `pnpm format`; add the gate run to the wave checklist (Wave 1).

**B2 (Block) — `pnpm lint` fails: 2 source errors, 10 test errors, 9 gate-denied warnings across 12 files.**
[exec] Source errors: `jwt-adapter.ts:358,399` `no-non-null-assertion` (`this.#userStore!`) — `#storeIdentity`/`#currentVersion` are only called where the store is checked, but the `!` is lint-forbidden; `password-encoder.ts:68` (`SCHEME_PREFIX`) and `scrypt-password-encoder.ts:48` (`PHC_FORM`) violate the repo's own `no-uppercase-regexp-constants` (STYLE_GUIDE §3.9) — RegExp instances are objects, must be camelCase. Warnings: `no-await-in-loop` in `drizzle-data-source.ts:58` (the previous `oxlint-disable-next-line` with justification was dropped when `createTableStatements` was extracted), `drizzle-migrator.ts:105` + `drizzle-repository.ts:95` (sequential DDL/migration application is intentional but now warns), three specs (credentials-auth-adapter, session-store, auth.spec), plus `no-unused-expressions` (`event-bridge.spec.ts:16`).
**Mitigation:** local-const guards instead of `!`; camelCase regex constants; restore the justified `oxlint-disable-next-line` comments where sequential application is the design; fix test warnings (Wave 1).

**B3 (Block) — wave is entirely uncommitted; compiled and generated outputs are stale.**
[exec] 35 modified + 46 untracked files (none staged). `apps/blue-api/lib/auth-store.d.ts` still declares sync `lookupPrincipal` while source is async, and ignored `doc-md/`/`doc-html/`/`.tscache/` outputs still document `CsrfInterceptor` after the CSRF rename. **Correction:** `git ls-files` confirms `lib/`, `doc-md/`, `doc-html/`, `.tscache/` are untracked and gitignored — nothing stale can ship; the artifacts are review-time noise only.
**Mitigation:** commit the wave as fixup commits after Waves 1–2; optionally regenerate or delete the stale ignored outputs before publishing docs (Wave 3).

### 2.2 Security

**SEC-1 (Must Fix) — `ScryptPasswordEncoder.verify` derives with attacker-influenced cost parameters → OOM/CPU DoS.**
[code] `#parse` reads `ln`/`r`/`p` and the hash length from the **encoded string** (`scrypt-password-encoder.ts:103-108`, `:130-135`) and `#derive` runs `scryptSync` with `N = 2 ** ln` and `maxmem = 128*r*N*2` (`:139-145`). Nothing caps the parsed values: a stored/user-supplied `$ln=30,…` string makes the first login attempt request ~2 TiB of memory budget. Trusted today only because `InMemoryUserStore` seeds known hashes; the same verifier will be pointed at DB/user/configured hashes — precisely the strings an attacker with any write vector can poison.
**Mitigation:** cap parsed params in `#parse` (e.g. `ln ≤ 24 ∧ r ≤ 32 ∧ p ≤ 8 ∧ keyLength ≤ 128`, throw `UnknownPasswordSchemeError` otherwise); regression test with an inflated `ln` string (Wave 2).

**SEC-2 (Should Fix) — HMAC secret missing → silently empty verification key.**
[code] `#resolveKey` returns `new TextEncoder().encode(this.#config.secret ?? '')` (`jwt-adapter.ts:232`) — with `algorithm: HS*` and no secret, verification fails closed (jose rejects short HS keys) but with an opaque jose error hidden inside `validate`'s `catch → null`; every token is "invalid" and the operator has no hint. `#signingSecret` correctly names the condition; `#resolveKey` should do the same.
**Mitigation:** throw the same `JWTTokenError('…HMAC secret…')` from `#resolveKey` when HS is configured without a secret (Wave 2).

**SEC-3 (Should Fix) — `findAllWhere` interpolates `LIMIT` and quoted identifiers without validation.**
[code] `drizzle-entity-manager.ts:175` `LIMIT ${options.limit}` and `:186` `"${condition.columnName}" = ?` — safe for today's callers (column names arrive allowlisted via `parseDerivedQuery`, limit as parsed int), but the method is public API on the entity manager; a caller passing a non-numeric limit or a column name containing `"` injects SQL.
**Mitigation:** coerce/validate `options.limit` (positive integer) and reject `"` in identifiers (or move identifier mapping behind the metadata allowlist at the same boundary the sort path uses) (Wave 2).

**SEC-4 (Should Fix) — `InMemorySessionStore` has no hard cap; `incrementTokenVersion` is not atomic.**
[code] `create` sweeps only when size ≥ 512 and only removes **expired** entries (`in-memory-session-store.ts:31-32`, `:61-66`): an attacker with valid credentials (or a leaky seed) can grow the live map without bound. `in-memory-user-store.ts` `incrementTokenVersion` is read-then-write; two concurrent `refresh` calls can each pass the `ver` check and mint two live token families (`jwt-adapter.ts` `refresh`) — benign in the single-threaded reference impl, a documented contract gap for production stores.
**Mitigation:** hard cap in `create` (reject when full after sweep); document/require conditional-increment semantics on the `UserStore` contract for `refresh` (Wave 2).

**SEC-5 (Nit/FYI) — `refresh` does not extend absolute session lifetime.**
[code] `rotate` re-issues with the old record's **remaining** TTL (`in-memory-session-store.ts:50`): a refresh 1 ms before expiry yields a 1 ms session; the demo's `sessionTtlMs` default 30 min. Absolute-expiry-preserving is defensible but should be a stated decision; sliding-window sessions need a different store.
**Mitigation:** document the semantics in the `SessionStore` contract + AD-33 doc (Wave 3, docs-only).

**SEC-6 (Nit) — `apps/blue-api/auth-store.authenticate` catch-all hides wiring errors as 401.**
[code] `catch { return null }` (`auth-store.ts:56-58`) also swallows "`initAuth()` must run before any auth flow" — fail-closed but un-debuggable. Demo-only; leave if preferred, else log once.

**SEC-7 (FYI) — logout is CSRF-attackable when the CSRF interceptor is not wired.**
[code] `POST /auth/logout` + `SameSite=Lax` session cookie (`session-cookie.ts`): a cross-site form POST carries the cookie, forcing a logout (nuisance only, no takeover; login is JSON+token so unaffected). The wave's own spec pins behavior only "when the interceptor is wired" (`auth.spec.ts:124`). Document posture or wire `CSRFInterceptor` for cookie routes in the demo (Wave 4 decision).

### 2.3 Code reuse — the `@blue/http` header module (explicit audit axis)

**RUS-1 (Should Fix) — new wave writes header **names** as string literals instead of `HTTPHeaders` constants.**
This wave's own remediation convention (09-25 RUS-2, and HEAD at `csrf-interceptor.ts:27`) is "write side keyed with `HTTPHeader` constants; lowercase record reads documented". The new code regresses on the write side:

- `session-cookie.ts:59,70` — `response.setHeader('Set-Cookie', …)` (constant `HTTPHeaders.SET_COOKIE` exists, `http-headers.ts:207`);
- `rate-limit-interceptor.ts:125` — `{ 'Retry-After': … }` (constant `HTTPHeaders.RETRY_AFTER` exists, `:671`).
  Also, the bearer-strip `token?.replace(/^Bearer\s+/i, '')` is now duplicated in **four** `apps/blue-api` controllers (`config-secrets-controller.ts:45`, `note-controller.ts:20`, `drizzle-note-controller.ts:55-57`, and `auth-controller`-adjacent flows) — the wave touched all of them; one shared helper removes the triple copy.
  **Mitigation:** key writes with the `HTTPHeaders` constants; extract a `bearerToken(headerValue)` helper in `apps/blue-api` (Wave 3).

**RUS-2 (clean) — read paths conform.** `HTTPHeader(name).get(record)` reads intact; cookies read through `NodeRequest.cookies` / `cookieValue(...)`; CSRF constant used. Confirmed no hand-rolled header parsing in any new file (`session-cookie.ts`, `node-session-interceptor.ts`, `rate-limit*.ts`, `jwt-adapter.ts`, both new stores — grep clean).

**RUS-3 (FYI) — stale (ignored) generated artifacts after the CSRF rename.** `doc-md/`/`doc-html/`/`.tscache/` still reference `CsrfInterceptor`, but all are untracked and gitignored — regenerate before the next docs publish, no repo action required (Wave 3).

### 2.4 Architecture / design

**ARC-1 (Should Fix) — eager relation fetch on `findAll` is N+1 per row.**
[code] `drizzle-repository.ts` `findAll(options)` maps `#fetchRelations` per entity (`Promise.all`) → one extra query per row per relation. Acceptable as explicit opt-in v1 (AD-31), but batch `IN`-clause loading is the documented follow-up; note it in the ADR rather than leaving it implicit.

**ARC-2 (FYI) — `NodeSessionInterceptor` ships with specs but zero wiring.**
[code] The interceptor is exported and spec-covered (`session-cookie.spec.ts:95-142`) but wired nowhere in `apps/`; the demo does auth in-handler and even documents the gap (`auth-controller.ts` `me()` docstring). Either wire it with `AuthRouteGuard` in the demo as the reference usage, or state explicitly it is a framework seam awaiting an app.

**ARC-3 (FYI) — intentional sequential loops now lint-fail.** The `no-await-in-loop` warnings in `drizzle-data-source.ts:58` (regression: the justified disable comment was dropped during the `createTableStatements` extraction), `drizzle-migrator.ts:105`, `drizzle-repository.ts:95` are the design (ordered migrations; DDL on one connection); restore the documented `oxlint-disable-next-line` comments (Wave 1, subsumed by B2).

**ARC-4 (clean) — the rest of the wave follows settled patterns:** `AuthAdapter` seam unchanged, store contracts against `blue-auth-core` interfaces, interceptor metadata gate (opt-in `@rateLimit`), problem-doc errors, entity metadata allowlists, `kind` markers on stores.

### 2.5 Naming

- **N-1 (Should)** — `PHC_FORM`, `SCHEME_PREFIX`: UPPER_SNAKE_CASE RegExp constants violate the repo's own oxlint rule + STYLE_GUIDE §3.9 (also B2). Rule states **RegExp instances are objects → camelCase** (`phcForm`, `schemePrefix`).
- **N-2 (Nit)** — JWT claims `ver`/`token_use` are framework-invented; document the claim namespace once in AD-33 so integration code doesn't collide.
- **N-3 (clean)** — file names kebab-case; new modules exported from package indexes without leaking `_`-internal files; `CSRFInterceptor` rename consistent with the acronym rule; `SESSION_COOKIE`/`setSessionCookie`/`buildSessionCookie` coherent.

## 3. Mitigation plan

| Wave                           | Scope                   | Items                                                                                                                                                                          | Verification                                                                                                                                |
| ------------------------------ | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Wave 1 — gates**             | Formatting + lint       | B1 (`pnpm format`), B2 (de-assert, regex constants camelCase, restore justified disables, test fixes)                                                                          | `pnpm lint` exit 0; `pnpm format:check` exit 0 (1409 files)                                                                                 |
| **Wave 2 — security**          | SEC-1..4                | Cost-param caps + regression; fail-loud HS secret; `LIMIT`/identifier validation in `findAllWhere`; session-store hard cap + store-contract note                               | New specs (inflated-ln string → throw; empty-HS secret → JWTTokenError; string limit rejected; cap-enforced store) + affected suites re-run |
| **Wave 3 — reuse + hygiene**   | RUS-1, RUS-3, B3, SEC-5 | `HTTPHeaders.SET_COOKIE`/`RETRY_AFTER`; shared bearer helper; regenerate typedoc (+ gitignore decision for doc/tscache output); rebuild `lib/`; document refresh-TTL semantics | `grep` counts of literals → 0 in wave files; docs regenerate clean; suites re-run                                                           |
| **Wave 4 — decisions/backlog** | ARC-1/2, SEC-7          | Batch-fetch follow-up in ADR; demo wiring of `NodeSessionInterceptor`+`AuthRouteGuard` or explicit seam note; demo CSRF posture for cookie routes                              | Reviewer sign-off on the two ADR notes; demo smoke (login → cookie → me → logout)                                                           |

**Process fix (carried from 09-25, unexecuted):** run `pnpm lint` + `pnpm format:check` before the wave commits — both must be green in the same commit that lands each wave.

## 6. Wave 5 — HTTPHeader category layer (2026-09-27, ratified in working session)

**Shape:** one base class + single-purpose subclasses (no mixin machinery, no behavior without a caller). Constants remain usable as bare names everywhere (`.name`/`String()`); constants migrate per-category as their consumers appear.

- `HTTPHeader.getJoined(headers, separator = ', ')` — multi-value (`string[]` Node records) joining, absorbing the join duplicated at `header-argument-resolver.ts:36` (the `static-resource-handler.ts:379` site keeps its documented lowercase-literal read convention; the capability exists if it wants it).
- `AuthorizationHeader extends HTTPHeader` — `bearerToken(value)` (scheme case-insensitive, trimmed, `null`/`undefined` → `undefined`); absorbed `apps/blue-api/src/bearer-token.ts` (deleted), controllers now read `HTTPHeaders.AUTHORIZATION.bearerToken(token)`.
- `ContentTypeHeader extends HTTPHeader` — `baseValue(value)` / `boundary(value)`, implementations moved up from `blue-platform-node/src/content-type.ts` (free functions kept as the primitives). Platform module reduced to a re-export hub (public surface preserved — DSG-4 precedent).
- `SetCookieHeader extends HTTPHeader` — `buildValue(name, value, attributes)`; absorbs the formatter in `session-cookie.ts` (`setHeader` now keys with `HTTPHeaders.SET_COOKIE.name`). Cookie read-side stays `parseCookies` (platform-node).
- Constants moved to subclasses: `AUTHORIZATION`, `CONTENT_TYPE`, `SET_COOKIE` (`http-headers.ts`). Static-handler `Accept` handling intentionally untouched (separator ',' semantics + documented read-literal convention).

**Verification:** blue-http 32 files / 369 passed incl. 10 new category specs; full gate sweep green (lint, format:check, build 33/33, all wave suites + blue-api 61 + blue-island). **Documented follow-ups:*** `Basic` scheme on `AuthorizationHeader` when a caller appears; batch IN-clause relation loading stays in the AD-31 Risks note.

## 7. Resolution log (findings addressed 2026-09-27)

| Finding                                     | Mitigation                                                                                                                                                                                                          | Where                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- |
| B1 — 61 unformatted files                   | `pnpm format` sweep; `format:check` green (1409 files) at wave end                                                                                                                                                  | repo-wide                                           |
| B2 — lint: `!` in source                    | Guards in `#storeIdentity`/`#currentVersion` (local `const store = this.#userStore` + explicit throw/return-null)                                                                                                   | `jwt-adapter.ts`                                    |
| B2 — lint: UPPER_SNAKE RegExp constants     | `PHC_FORM` → `phcForm`, `SCHEME_PREFIX` → `schemePrefix` (STYLE_GUIDE §3.9)                                                                                                                                         | `scrypt-password-encoder.ts`, `password-encoder.ts` |
| B2 — lint: no-await-in-loop                 | Justified disables restored (`drizzle-data-source.ts` init — regression from the `createTableStatements` extraction; `drizzle-migrator.ts` ordered apply); `#fetchRelations` genuinely parallelized (`Promise.all`) | drizzle sources                                     |
| B2 — lint: test warnings                    | `Promise.all` for case matrices, justified disable for the sequential login budget, `requireNodeRequest`/`sessionToken` helpers replace `!` (10 sites)                                                              | 4 spec files                                        |
| B2 — lint: no-unused-expressions            | `on()` conditional-expression statement → if/else                                                                                                                                                                   | `event-bridge.spec.ts`                              |
| SEC-1 — scrypt cost DoS                     | `#parse` caps `ln ≤ 18, r ≤ 16, p ≤ 4, salt/key ≤ 64 B` → `UnknownPasswordSchemeError`; regression: inflated-ln hash → `verify` false + `needsRehash` throws                                                        | `scrypt-password-encoder.ts` + spec                 |
| SEC-2 — silent empty HS key                 | Constructor rejects HS* without `secret` (`JWTTokenError`); regression: ctor throws                                                                                                                                 | `jwt-adapter.ts` + spec                             |
| SEC-3 — SQL interpolation in `findAllWhere` | Condition columns allowlisted against `meta.columns`; `limit` must be a non-negative integer; regression: injected column name + string limit rejected                                                              | `drizzle-entity-manager.ts` + spec                  |
| SEC-4 — unbounded session store             | `maxSessions` cap (default 512): sweep then reject; contract doc (SHOULD bound storage); spec: full store rejects, expiry frees the slot                                                                            | `in-memory-session-store.ts` + contract + spec      |
| SEC-5 — refresh-TTL semantics               | `rotate` TTL semantics documented on the `SessionStore` contract (reference impl preserves remaining TTL)                                                                                                           | `blue-auth-core/src/session-store.ts`               |
| RUS-1 — literal header writes               | `HTTPHeaders.SET_COOKIE` / `HTTPHeaders.RETRY_AFTER` keyed writes (mirrors csrf-interceptor/static-handler)                                                                                                         | `session-cookie.ts`, `rate-limit-interceptor.ts`    |
| RUS-1 — bearer regex ×4                     | Shared `bearerToken(authorization)` helper (scheme case-insensitive, trimmed); 7 call sites                                                                                                                         | `apps/blue-api/src/bearer-token.ts` + 3 controllers |
| B3/RUS-3 — stale outputs                    | Corrected: `lib/`/`doc-md/`/`doc-html/`/`.tscache/` are untracked + gitignored; nothing ships. Regenerate before next docs publish                                                                                  | plan doc correction                                 |
| N-1/– — `mockMVC` → `mockHTTP`              | User-directed -MVC naming cleanup (class is `MockHTTP`; variable now `mockHTTP`) across 12 spec/src files + harness plan + README                                                                                   | repo-wide, 0 `mockMVC` remaining                    |
| ARC-1 — N+1 batch fetch                     | Already documented in AD-31 Risks ("relation-aware JOIN loading is a future optimization")                                                                                                                          | AD-31                                               |
| ARC-2 — interceptor seam                    | Documented usage in guide 11 §1; demo posture (platform-owned mapping, in-handler auth) documented in `auth-controller`                                                                                             | guide 11                                            |
| SEC-7 — logout CSRF                         | Posture note added to guide 11 §6 (SameSite=Lax cross-site logout is nuisance-only; wire `CSRFInterceptor` for further cookie-mutating routes)                                                                      | guide 11                                            |

## 8. Wave 6 — MediaType hardening + adoption (2026-09-27, ratified in working session)

**Scope:** the static-file/MIME sniffing surfaces bypassed `@blue/core`'s `MediaType`; landed with it hardened for raw HTTP header values.

**MediaType (blue-core):**
- `for()`/`parseMediaType` raw-value path now **normalizes before interning**: type/subtype and parameter NAMES case-folded (RFC 6838 §4.2 / RFC 2045 §5.1), parameter values split on the first `=` (values containing `=` survive), quoted values unquoted. Header-case variants converge on one interned instance (`for('TEXT/HTML') === MediaTypes.TEXT_HTML`).
- `stringifyParameters` re-quotes values containing header separators — parse/toString round-trip safe (`boundary="x y"`).
- **`get isJSON`** — bases + `+json` suffix, absorbing the `endsWith('+json')`/`includes('application/json')` sniffing.
- **`static parseAccept(header)`** — q-preserving `MediaType[]` in header order (empty segments dropped; bare type tokens become `type/*` wildcards).
- **`static registered(type, subtype, parameters)`** — the never-null registry path; `MediaTypes.*` constants now use it (33 constants typed non-null, killing the `requireMediaType` guard witnesses: helper removed from `node-app-configuration`).
- New constants: `TEXT_JAVASCRIPT`, `APPLICATION_WASM`, `FONT_WOFF2`.

**Adoption (8 sites):**
- `static-resource-resolver.ts` MIME allowlist → `MediaTypes` instances (`withCharset('utf-8')` for text entries; serialized canonically — served header dropped the RFC-permitted optional space; 5 pinned assertions updated); directory-listing contentType constant-sourced.
- `static-resource-handler.ts` `acceptsHtml` → `parseAccept` + `matches()` + `qualityFactor > 0` — **fixes the documented q=0 approximation** (RUS-5 note retired); octet-stream fallback constant-sourced.
- `http-request-limits.ts` JSON body gate → `MediaType.for(mime)?.isJSON`.
- `transform-interceptor.ts` (7× `includes()`, importing MediaType and bypassing it) → `isJSON`/`type==='text'`/base-type checks in `extractBody`/`serializeBody`.
- JSON response writes in `node-dispatcher`/`node-view-target`/`response-entity-view` → `[HTTPHeaders.CONTENT_TYPE.name]: String(MediaTypes.APPLICATION_JSON)`.
- `blue-http/content-type-header.ts` credentials: `MULTIPART_FORM_DATA` now `String(MediaTypes.MULTIPART_FORM_DATA)` (single source), `contentTypeBase`/`multipartBoundary` delegate to `MediaType.for` (boundary gets case-insensitive names + unquoting for free).

**Verification:** gates green (lint 0, format:check 0, build 33/33); suites: blue-core 302 (8 new Wave-6 specs), blue-http 369, blue-platform-node 410, blue-view 101, plus full sweep.
