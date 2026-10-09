# 2026-10-08 Shared-store rate limiting — `@blue/rate-limit`

**Date:** 2026-10-08
**Status:** Executed (see §7)
**Decision:** [AD-79](../decisions/2026-10-08_AD79_SHARED_STORE_RATE_LIMITING.md)
**Scope:** GAP-8 of the 2026-10-07 delta sweep
(`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6): shared-store
fixed-window rate limiting — the async `RateLimiter` SPI as a leaf package,
the platform cutover, and the Redis driver.

---

## 1. Problem

AD-33's `@rateLimit` enforcement is per-process: `FixedWindowRateLimiter`
keeps its counters in the process's memory, so N nodes multiply the
effective budget by N — a brute-force client simply round-robins. The SPI
already carries the "Redis later" comment; what is missing is the async
seam (the SPI is synchronous, node-redis is not), a home a Redis driver
can depend on without pulling the platform tier (REU-9), and the driver
itself.

## 2. Current state (verified 2026-10-08)

| Seam          | What exists                                                                                                         | What is missing                                      |
| :------------ | :------------------------------------------------------------------------------------------------------------------ | :--------------------------------------------------- |
| Metadata      | `@rateLimit` class/method decorator (method wins, decoration-time validation) + `RATE_LIMIT_KEY`                    | —                                                    |
| Enforcement   | `RateLimitInterceptor` (default-on, metadata-gated), 429 + `Retry-After`, keyed on the AD-37 client IP              | an async store call (chain already awaits)           |
| SPI           | `RateLimiter.consume` (sync), `RateLimitPolicy`, `RateLimitResult`, `validateRateLimitPolicy` in blue-platform-node | async contract (AD-39); a dependency-light leaf home |
| Counter store | `FixedWindowRateLimiter` (in-memory, SEC-2 bound)                                                                   | shared store; restart survival                       |
| Wiring        | `NodeAutoConfiguration.rateLimiter()` bean (bare `@entry()`)                                                        | `RATE_LIMITER` token registration (AD-73 pattern)    |
| Backends      | `RedisConnection` (borrowed; subpaths `./cache`, `./locks`, `./jobs`, `./pubsub`)                                   | a rate-limit driver                                  |

## 3. Change

1. **`@blue/rate-limit`** (new, layer 2): `RateLimiter` SPI with async
   `consume` (AD-39), `RateLimitPolicy` / `RateLimitResult`,
   `validateRateLimitPolicy`, `likeRateLimiter` guard,
   `FixedWindowRateLimiter` (moved unchanged; instance-scoped, SEC-2
   bound), `RATE_LIMITER` context token.
2. **`@blue/platform-node`**: interceptor awaits `consume`; bean
   registered as `@entry(RATE_LIMITER)`; `src/rate-limit.ts` deleted —
   clean cutover, no re-exports; `@rateLimit` metadata and the 429
   behavior unchanged.
3. **`@blue/redis/rate-limit`**: `RedisRateLimiter` — fixed windows in one
   Lua script (`INCR`, `PEXPIRE` on first request of a window, `PTTL`
   readback), keys `blue:rl:<namespace>:<windowMs>:<key>`, borrowed
   connection, sealed `close()`, **fail-closed by default**
   (`onError: 'fail-open'` logs through `@blue/log` and allows — the
   documented availability escape hatch).
4. **Wiring/docs**: vitest alias + spec-tsconfig paths for both packages;
   apps importing `RateLimitPolicy` migrate to `@blue/rate-limit`;
   ARCHITECTURE package map (+`@blue/rate-limit`, redis row, platform-node
   hub count 16 → 17); guide 11 §5 + guide 16; security architecture row;
   audit-row note; CHANGELOG; generated API docs.

Per-process "one budget" is unchanged and remains the default (the bean);
multi-process deployments override the bean with `RedisRateLimiter`.

## 4. Deliberately out of scope

- Composite keys (user + IP), per-route budgets beyond policy,
  connection-count fairness — nothing consumes them yet (Wave-6 rule).
- Sliding-window / token-bucket algorithms — the AD-33 contract is fixed
  window; a later driver can implement another algorithm behind the same
  SPI.
- PG/store-agnostic drivers — no consumer; the Redis driver is the
  capacity item GAP-8 names.

## 5. Failure posture

`'fail-closed'` (default): an unreachable store rejects the consume → the
platform error path fails the request. A rate-limit outage must surface,
not silently widen the budget ledger; it must also not masquerade as a
429 (`Retry-After` tells the client to retry — wrong for a storage
failure). `'fail-open'`: log every allowance through `@blue/log` and
allow. Malformed Lua replies are a storage failure in both postures —
never a free pass.

## 6. Verification

- `@blue/rate-limit` (7): kind, allow/deny + `retryAfterMs`, distinct
  keys, window reset via real delay, fail-loud policies, SEC-2 cap
  eviction, SEC-2 flood bound.
- `@blue/redis/rate-limit` (11, live standalone Redis 6.2+): kind, budget
  with shrinking remainder, window reset, **two nodes share one budget**,
  namespace isolation, distinct keys/windows, fail-loud policies, key
  validation, fail-closed on an unreachable store, fail-open allows +
  logs, closed latch, construction validation.
- `@blue/platform-node` (6): decorator decoration-time validation,
  metadata-gated pass-through, per-address 429 + `Retry-After` problem,
  per-address budgets, method-over-class policy, fallback key.
- Full gate set (§9 of the review plan) incl. the spec-typecheck lane,
  `pnpm doc` freshness (new package API docs committed), and the
  manifest/agents checks.

## 7. Execution log (2026-10-08)

All changes landed in one pass with the verification above green;
`pnpm install` wired the new workspace package and the lockfile.
Substrate notes: the interceptor chain needed only the `await` (async
`preHandle` was already a supported contract shape); the moved limiter
spec replaced the `@blue/util` delay with promisified
`node:timers/promises` `setTimeout` so the leaf keeps a single dependency
(`@blue/factory` for the token). The redis lane's cleanup scans
`blue:rl:<namespace>:*` exactly like the lock lane scans
`blue:locks:<namespace>:*`.
