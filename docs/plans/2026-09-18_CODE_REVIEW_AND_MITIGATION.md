# Code Review & Remediation Plan — AD-24 (caching) + AD-25 (security headers) waves

**Date:** 2026-09-18
**Scope:** Recent changes only — the `@blue/cache` package and its wiring (AD-24, commits `c380c1cc`..`e77074f3`) and the default-on security-headers interceptor (AD-25, commits `4798166b`, `1333a8cb`, `68b2c3a4`). Plus verification that the previously-flagged STOMP-wave critical fixes (SEC-3 fail-open, SEC-1 queue-store leak) actually landed in the tree. Untouched older subsystems are out of scope; the full AD-21/22/23 review is in `2026-09-17_REVIEW_AND_REMEDIATION.md`.
**Method:** Read of every new/changed source in both waves (`cache.ts`, `cached.ts`, `memoize.ts`, `keys.ts`, `cache-manager.ts`, `security-headers-interceptor.ts`, `node-auto-configuration.ts`, the `blue-api` demo gate); live execution of repository gates (`pnpm lint`, `pnpm format:check`), package tests (`@blue/cache` vitest); runtime inspection of the Helmet 8.3.0 build to confirm header behavior; source read of the socket dispatch path and queue store to verify the ST fixes.

**Status:** Findings addressed 2026-09-18 — M1/S1/S2/S3 code + regression tests landed in `@blue/cache` (`keys.ts`, `cached.ts`, new `test/keys.spec.ts`); D1 documented in the interceptor JSDoc. Repository gates green (lint, format), `@blue/cache` 47/47 and `@blue/platform-node` 263/263 pass, `tsc -b` clean. Resolution log in §5.
**Legend:** `[exec]` reproduced by execution · `[code]` established by reading the cited lines · `[spec]` quoted from a spec/standard.

---

## 1. Verified baseline (what is healthy — do not "fix")

| Item                                                  | Evidence                                                                                                                                                                                                                                                                     | Result                                                                                                         |
| ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `pnpm lint` (`oxlint --type-aware --deny-warnings .`) | run 2026-09-18                                                                                                                                                                                                                                                               | ✅ exit 0 (was red: 54 warnings in the AD-21/22/23 wave; cleared)                                              |
| `pnpm format:check`                                   | run 2026-09-18, after fix                                                                                                                                                                                                                                                    | ✅ all 1307 files pass (see B1 — was red on 3 AD-25 files, now fixed)                                          |
| `@blue/cache` tests                                   | `cd packages/blue-cache && pnpm test`                                                                                                                                                                                                                                        | ✅ 47/47 (+ new keys.spec.ts; S1 single-flight, S2 guarded-write, S3 degradation + M1 opt-in regression tests) |
| SEC-3 fail-open → fail-close                          | `node-http-server-adapter.ts:708-727` — socket dispatch reads `#socketAuthRequirements(target)`, checks `session.attributes['principal']`, closes `1008` on missing principal / missing role; identity source is the `authenticate` hook / `socketRequestAuthenticator` bean | ✅ landed (was fail-open by construction in the prior wave)                                                    |
| SEC-1 queue-store memory leak                         | `message-store.ts:367-368` — `#evictDestinationsPastCap` deletes both `#byDestination` **and** `#seqs`; `#seqs` no longer outgrows the destination cap                                                                                                                       | ✅ landed (was: `#seqs` written per attacker-chosen `/queue/<name>` and never deleted)                         |
| AD-25 header set                                      | Helmet 8.3.0 built at construction; CSP default-on, HSTS, XFO, XCTO, Referrer-Policy, CORP, COOP, Origin-Agent-Cluster, DNS/download/XSS controls present; `xPoweredBy()` **removes** `X-Powered-By` (confirmed against the 8.3.0 build)                                     | ✅ sound                                                                                                       |
| `@cached` DI wiring                                   | beans implement `ApplicationContextAware`; demo gate resolves `cacheManager` from context (`cached-report-controller.ts:39-41`)                                                                                                                                              | ✅ real, zero-wiring for Node apps                                                                             |

---

## 2. Findings

### 2.1 Blocks — repository gates

**B1 (Block, now resolved) — `pnpm format:check` failed on the AD-25 wave.**
`[exec]` Three files from the newest commit were not run through `oxfmt`:
`packages/blue-platform-node/src/security-headers-interceptor.ts`,
`packages/blue-platform-node/test/security-headers.spec.ts`, and
`docs/plans/2026-09-18_SECURITY_HEADERS.md`. `pnpm format:check` exited 1. This is the same pattern as the prior wave's GATE-2 (a wave lands unformatted; the gate went red and stayed red).

**Mitigation (applied):** ran `oxfmt --write` on the three files; re-ran `pnpm format:check` → all 1307 files pass, exit 0. **Preventive:** enforce formatting in CI/pre-commit so a wave cannot merge unformatted. The AD-25 plan doc (`2026-09-18_SECURITY_HEADERS.md`) should list `pnpm format:check` as its final verification step, matching the pattern already used for other waves.

### 2.2 Caching package design (`@blue/cache`, AD-24)

**M1 (Must Fix) — default cache keys collide under JSON serialization.**
`[code]` `keys.ts:19-20` — `serializeCacheKey(...args)` is `JSON.stringify(args)`. The module documents the semantics, but they are a real footgun in a public memoization API: `[undefined]` and `[null]` both serialize to `"[null]"` (distinct argument lists map to one key), and object key _insertion order_ is significant (`{a:1,b:2}` ≠ `{b:2,a:1}`). A caller that distinguishes "not provided" from an explicit `null`, or builds objects without a stable key order, gets silent cache hits on the wrong input. For a cache-aside keyed by method arguments this turns into incorrect served values, not just a perf nuance.

**Mitigation:** (a) document the collision classes at the top of `serializeCacheKey` and in the `key:` option JSDoc with an explicit example; (b) add an optional strict key mode that type-tags each argument (e.g. encode `typeof`/tag so `undefined` ≠ `null` and arrays/objects are order-stable), used by default for object args. Low-risk first step is (a); (b) is the durable fix — weigh against changing documented key semantics (treat as a minor-version decision).

**S1 (Should Fix) — no single-flight in `@cached`; asymmetric with `memoize`.**
`[code]` `cached.ts:143-158` — on an async miss the wrapper calls the target and writes on settle (`void Promise.resolve(result).then(...)`); there is **no** in-flight map. `memoize.ts:64,71-98` _does_ coalesce concurrent calls for the same key behind one promise. So two public surfaces with the same job diverge: a hot expired key under concurrent load both recompute (cache thundering herd) under `@cached`, while `memoize` does not. Documented as a v1 limitation (`cached.ts:97-100`), but the asymmetry is itself the smell.

**Mitigation:** add an `inflight: Map<string, Promise>` to the `@cached` async path mirroring `memoize` (return the shared promise on hit; clear on settle/reject). ~30 lines. If deferred, document the concurrency caveat next to the existing v1 note and make it a named follow-up.

**S2 (Should Fix) — fire-and-forget cache write swallows errors.**
`[code]` `cached.ts:147-152` — the async write is `void Promise.resolve(result).then(onFulfilled, () => undefined)`; a future `store.set` failure (e.g. a distributed store that throws on eviction/quota) is silently dropped, and so is any rejection detail. Acceptable for the in-memory v1 but the swallow path is invisible.

**Mitigation:** attach an explicit `.catch` that logs at warn level (or routes to a hook). Keeps graceful-degradation semantics while making write failures observable.

**S3 (Should Fix) — silent graceful-degradation hides mis-wiring.**
`[code]` `cached.ts:126-130` — when the instance has no `cacheManager`, the wrapper calls the raw method with **no error and no warning**. This is intentional for unit tests, but it also means a bean whose DI failed (property-name collision on `cacheManager`, missing bean, wrong context) caches nothing while looking correct in tests and prod. The degradation is silent by design; silence is the risk.

**Mitigation:** emit a one-time dev-mode warning (e.g. `console.warn` guarded by an env/`process.env.NODE_ENV !== 'production'`) when a `@cached` method degrades, or expose a diagnostic (`cacheManager` presence check) via `getCachedSpec`. Balance against noise — scope the warning to first invocation per method.

**S4 (Optional / note) — TTL expiry is lazy only.**
`[code]` `cache.ts:100-102`, `#expired` at `208-210` — expired entries are removed on access, never by a background sweep (intentional `TtlContentSource` model for browser/worker safety). Under write-heavy / low-read workloads with short TTLs, memory lingers until the key is next touched. Intentional and documented; flagging the tradeoff so it isn't mistaken for a bug if heap growth is later observed. A bounded background sweeper is a future option, not now.

### 2.3 Security headers (AD-25)

**D1 (Design / note) — default CSP `connect-src` admits WebSocket to any origin.**
`[code]` `security-headers-interceptor.ts:46` — `DEFAULT_CONNECT_SRC = ["'self'", 'ws:', 'wss:']`. Bare `ws:`/`wss:` (no origin) lets a page open WebSocket connections to any host. Documented as AD-25 D1 and necessary because the framework ships its own WebSocket server against an unknown origin at CSP-build time. **Mitigation:** keep it as the safe default for the framework's shape, but allow per-app scoping of `connect-src` (and thus the ws origins) via `SecurityHeadersInterceptorOptions.headers.contentSecurityPolicy.directives['connect-src']`, and document that bare `ws:`/`wss:` is permissive. No change required now; the escape hatch already exists through Helmet's option surface.

Everything else in AD-25 is sound: default-on, `X-Powered-By` stripped (confirmed), full standard header set, last-write-wins documented, skips socket upgrades / flushed responses.

---

## 3. Remediation plan (prioritized)

| ID  | Severity         | Mitigation                                                                                              | Effort   | When                                                |
| --- | ---------------- | ------------------------------------------------------------------------------------------------------- | -------- | --------------------------------------------------- |
| B1  | Block (resolved) | `oxfmt --write` applied; gates green now. Add format check to wave verification checklist / pre-commit. | done     | done                                                |
| M1  | Must Fix         | Document collision classes + add optional strict (type-tagged) key mode for object args.                | Med      | Next PR — highest-value correctness fix in the wave |
| S1  | Should Fix       | Add single-flight `inflight` map to `@cached` async path, mirroring `memoize`.                          | Small    | Follow-up; closes the memoize/`@cached` asymmetry   |
| S2  | Should Fix       | Explicit `.catch` (warn) on the fire-and-forget cache write.                                            | Small    | Same PR as M1/S1                                    |
| S3  | Should Fix       | One-time dev-mode warning on graceful-degradation.                                                      | Small    | Follow-up; guard to first-call-per-method           |
| D1  | Design           | Document bare-ws permissiveness; scoping already available via Helmet options.                          | None now | Optional hardening                                  |
| S4  | Note             | No action; lazy expiry is intentional. Record tradeoff.                                                 | —        | Info only                                           |

**Suggested sequencing:** land M1 + S2 together (correctness + observability, small surface in `keys.ts`/`cached.ts`, add a regression test for the null/undefined key collision), then S1 as a focused single-flight backport, then S3. B1 is closed; keep gates green by running `pnpm format:check` before every wave commit.

---

## 4. Verification of remediation

- Re-run `pnpm lint` and `pnpm format:check` → both exit 0 after B1 fix.
- `cd packages/blue-cache && pnpm test` → 47/47 (keys.spec.ts for M1; cached.spec.ts adds S1 single-flight, S2 guarded-write, S3 degradation; memoize.spec.ts adds M1 opt-in).
- `@blue/platform-node` → 263/263 (the interceptor change is comment/JSDoc-only; suite green).
- `tsc -b` clean for `@blue/cache`; repo `pnpm lint` + `pnpm format:check` exit 0.

---

## 5. Resolution log (findings addressed 2026-09-18)

| Finding                                                                               | Mitigation                                                                                                                                                                           | Where                                                                                                                                                          |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| M1 — JSON cache-key collisions (`undefined`/`null` collapse, order-sensitive objects) | Added type-tagged `serializeCacheKeyStrict`; documented the default's collision classes; exported via wildcard re-export. Opt-in through the `key:` option of `memoize` / `@cached`. | `packages/blue-cache/src/keys.ts:27` (documented), `:53-90` (`serializeCacheKeyStrict`, `tagValue`); regression in `test/keys.spec.ts`, `test/memoize.spec.ts` |
| S1 — no single-flight in `@cached`                                                    | Added an `inflight` Map keyed by cache key; concurrent async misses coalesce behind one computation (mirrors `memoize`); slot freed on settle/reject so it cannot grow unbounded.    | `packages/blue-cache/src/cached.ts:130,163,186,190`; test in `test/cached.spec.ts`                                                                             |
| S2 — fire-and-forget write swallows errors                                            | Guarded the fulfilled-path `store.set` with try/catch + `console.warn`; rejections still free the slot and propagate to the caller.                                                  | `packages/blue-cache/src/cached.ts:178-185`                                                                                                                    |
| S3 — silent graceful-degradation                                                      | One-time dev-mode `console.warn` when a `@cached` method runs without a `CacheManager`.                                                                                              | `packages/blue-cache/src/cached.ts:132,141-142,212`; test in `test/cached.spec.ts`                                                                             |
| D1 — bare-ws CSP permissiveness                                                       | Documented that default `connect-src` admits any-origin WebSockets and how to scope it via the Helmet `contentSecurityPolicy` option.                                                | `packages/blue-platform-node/src/security-headers-interceptor.ts:46-48,63-67`                                                                                  |
