# AD-79: Shared-store rate limiting — async `RateLimiter` SPI, `@ndigo/rate-limit`, Redis fixed-window driver

**Date:** 2026-10-08
**Status:** Accepted, executed 2026-10-08 (see the
[companion plan](../plans/2026-10-08_SHARED_STORE_RATE_LIMITING.md); guide 11
§5 and guide 16 updated at execution) — GAP-8 of
`docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6, Wave-6 capacity track
**Deciders:** Framework owner

---

## Context

The 2026-10-07 review lists GAP-8: **shared-store rate limiting** — severity
medium, status **partial** ("`RateLimiter` SPI, memory-only"); recommended
shape "Redis driver via the existing SPI". Wave 6 is ADR-gated ("GAP-8..15
stay ADR-gated"); this record is the gate.

What the repository already provides (verified at HEAD, 2026-10-08):

- **The enforcement seam is complete; the store is not.** AD-33 Wave 3
  shipped `@rateLimit` (passive class/method metadata, method wins,
  decoration-time validation), `RateLimitInterceptor` (default-on in
  `NodeAutoConfiguration.handlerMapping`, metadata-gated — routes without
  metadata are untouched), 429 + `Retry-After` problem documents
  (`urn:ndigo:rate-limited`), and `FixedWindowRateLimiter` — per
  `(windowMs, key)` in-memory buckets with the SEC-2 bound (sweep + oldest
  eviction at 10 000 entries). AD-37 resolved the keying half of the
  peer-gap note ("behind a LB every client may look like the proxy"):
  `NodeRequest.remoteAddress` walks `X-Forwarded-For` rightmost-first
  through the `TrustedProxySet` allowlist.
- **The SPI already promises Redis.** `packages/ndigo-platform-node/src/rate-limit.ts`
  — the `RateLimiter` interface — is documented as "an integration point
  for distributed backends (Redis) later — the in-memory reference
  implementation ships now". The gap is the implementation, not the seam.
- **The wiring anticipates an override.** `NodeAutoConfiguration.rateLimiter()`
  — the bean injected into the interceptor — documents "apps needing a
  distributed backend provide their own `RateLimiter` implementation";
  it is registered with a bare `@entry()` while the AD-73 bean family
  (AD-34 TypeScript-native layer) registers under `ContextToken`s.
- **The constraint is the sync SPI.** `consume(key, policy): RateLimitResult`
  is synchronous; node-redis is inherently async. The interceptor chain
  already awaits: `RouteHandlerInterceptor.preHandle` is
  `PreHandleOutcome | Promise<PreHandleOutcome>`
  (`packages/ndigo-dispatcher/src/route-handler-interceptor.ts:21`) and the
  execution chain `await`s each outcome
  (`route-handler-execution-chain.ts:139`). AD-39 ("async by default")
  governs the naming/marking conventions.
- **The integration precedent is AD-73.** GAP-3 shipped the same topology:
  a leaf SPI package (`@ndigo/locks`) with the in-process driver and a
  `ContextToken`, the platform bean registered under the token, and the
  Redis driver as an optional subpath of `@ndigo/redis` (`@ndigo/redis/locks`,
  peer-optional on the SPI package). REU-9 fixed the inverse mistake the
  same week (`@ndigo/inspect` pulling the boot tier transitively) — a Redis
  driver depending on the platform tier would re-create that coupling.

## Evidence

- Peer survey from the 2026-10-06/07 gap analyses: the peer options are
  pluggable stores under one contract — `@fastify/rate-limit` store
  plugins, `@nestjs/throttler` storage — i.e., "one limiter API, swap the
  counting backend". Bucket4j/Jedis-style Redis backends count with atomic
  server-side increments over fixed windows.
- Redis `INCR` + `PEXPIRE`-on-first (window anchored at the first request,
  matching the in-process bucket's `windowStart`) + `PTTL` readback
  reproduces the fixed-window semantics exactly, in one atomic Lua script
  (race-free check-and-count; the `RedisLockDriver` established the
  Lua-script pattern in this repo, `@redis/client` 6.3.0 pinned).
- The in-process limiter's SEC-2 eviction machinery exists because memory
  is finite; Redis TTLs expire keys server-side — no client-side eviction
  is needed, and budgets survive process restarts (a correctness property,
  not just scaling, when the process holding the counters dies
  mid-window).
- Fixed windows are the AD-33 contract (`RateLimitPolicy` + `Retry-After`
  semantics); nothing in GAP-8 asks to change the algorithm, only where
  the counters live.

## Decision

### D-1 — `RateLimiter.consume` becomes async (AD-39)

`consume(key, policy): Promise<RateLimitResult>`. No sync twin, no
`*Async` suffix — the in-process implementation stays effectively
synchronous behind the await. `RateLimitInterceptor.preHandle` awaits.
This is a pre-1.0 public API break, executed as a clean cutover — all
callers migrate, no re-exports or deprecated aliases. The contract
complements stay: fail loud (`RangeError`) on malformed policies, safe
for concurrent use.

### D-2 — The SPI moves to a leaf package `@ndigo/rate-limit`

New package (AD-73's topology; layer 2, isomorphic): `RateLimitPolicy`,
`RateLimitResult`, `RateLimiter`, `validateRateLimitPolicy`,
`likeRateLimiter` guard, `FixedWindowRateLimiter` (moved unchanged), and
the `RATE_LIMITER` context token. `@ndigo/platform-node` keeps the
enforcement surface — `@rateLimit` metadata, `RATE_LIMIT_KEY`, the
interceptor — and registers its bean under `@entry(RATE_LIMITER)` (AD-34
token alignment; the AD-73 `lockDriver` bean is the template). The
decorator's options type and the interceptor's limiter type come from the
SPI package. A driver in `@ndigo/redis` therefore peers on a dependency-
light contract instead of pulling the dispatcher/router web tier
(REU-9's lesson).

### D-3 — `@ndigo/redis/rate-limit`: `RedisRateLimiter`, fixed windows in one Lua script

Borrowed `RedisConnection` + `namespace` (the AD-40 driver shape), key
`ndigo:rl:<namespace>:<windowMs>:<key>` — the window is part of the key,
exactly like the in-process bucket key, so policies with different windows
never share a budget. One Lua script per consume: `INCR`, `PEXPIRE` on
the first request of a window (window anchored at first request, matching
`windowStart`), `PTTL` readback as the `retryAfterMs` basis. Malformed
Lua replies are a storage failure, never a free pass. `close()` seals the
driver; the borrowed connection is untouched.

### D-4 — Fail-closed by default; fail-open is the documented escape hatch

When the store is unreachable, `RedisRateLimiter.consume` **rejects** —
the platform error path fails the request rather than passing it through
unthrottled (or misreporting it as 429 with `Retry-After`). This is the
security-correct posture for a brute-force control (SEC-6): an outage
must surface, not silently widen the budget ledger to infinity.
`onError: 'fail-open'` is an explicit opt-in for availability-sensitive
deployments; it logs every allowance through `@ndigo/log` (no raw
console — the wave-5 recurrence invariant). The in-process limiter never
fails; this option exists only on the shared-store driver.

### D-5 — Keying unchanged: the store is the node, not the key

The interceptor keeps keying on `NodeRequest.remoteAddress` through the
AD-37 trusted-proxy walk, with the `'unknown'` shared fallback. GAP-8's
scope is where counters live, not who the client is; composite keys
(user + IP), per-route budgets beyond policy, and connection-count
fairness stay out of scope until a consumer exists (Wave-6 rule for
GAP-10/11/12/14-class items).

### D-6 — Semantics parity is a test contract

Both drivers must agree: atomically allow up to `limit` per (window, key),
deny after with `retryAfterMs` = exact window remainder, windows anchored
at first request, distinct keys and distinct windows independent. The
live Redis lane asserts the cross-node property the memory driver cannot:
**two drivers on separate connections, same namespace, share one budget**
(the lock-driver live-lane pattern, skipped without
`NDIGO_REDIS_TEST_URL`). A malformed policy must fail loud on both.

## Alternatives considered

- **Redis driver inside `@ndigo/platform-node`**: couples the platform tier
  to a leaf adapter and forces a node-redis dep on every platform consumer.
  Rejected — REU-9 fixed this exact class; AD-73's leaf-SPI topology is
  the settled pattern.
- **Sync Redis access**: no sync client exists in this stack, and a
  buffered/local-predict sync facade would decide at the wrong layer
  (deny decisions made on local state defeat the shared store). Rejected —
  the chain already awaits `preHandle`; D-1 is a signature change only.
- **Sliding-window / token-bucket backend**: better burst smoothing, but
  the AD-33 contract is fixed-window (`RateLimitPolicy` + `Retry-After`
  remainder semantics documented in guides and the demo). A later driver
  can implement a different algorithm behind the same SPI; D-6's parity
  tests pin the current one.
- **A required peer of `@ndigo/rate-limit` on `@ndigo/redis`**: `@ndigo/redis`
  keeps all capability contracts optional peers (AD-40); the rate-limit
  peer joins that list.

## Consequences

- Multi-process deployments enforce one global budget per (window, key):
  N nodes no longer multiply the effective limit by N. Budgets survive
  process restarts (server-held TTL counters).
- Public API break in `@ndigo/platform-node`: `RateLimiter`/`RateLimitPolicy`/
  `RateLimitResult`/`validateRateLimitPolicy`/`FixedWindowRateLimiter` move
  to `@ndigo/rate-limit`; `consume` is async; the bean registers under
  `RATE_LIMITER`. Apps importing `RateLimitPolicy` migrate to
  `@ndigo/rate-limit`; the `@rateLimit` decorator and the 429 behavior are
  unchanged.
- Fail-closed means a Redis outage fails requests on limited routes
  (platform error path) — operators must choose `fail-open` explicitly and
  watch the log. Documented in the driver, the guide, and this ADR.
- `@ndigo/redis` gains `@ndigo/log` (fail-open observability) and the
  optional `@ndigo/rate-limit` peer; `@ndigo/platform-node` gains
  `@ndigo/rate-limit` as a dependency.
- The in-process limiter keeps its SEC-2 bound and per-instance state;
  "one budget per process" is the documented wiring contract (one bean).

## Execution notes (2026-10-08)

- The interceptor chain needed no changes beyond the await: the dispatcher
  already awaits async `preHandle` outcomes (confirmed by the existing
  async interceptor specs; the logging interceptor already returns
  promises).
- The moved limiter spec ports exactly with `await`; the interceptor spec
  gains the same. The `@ndigo/util` delay helper in the moved spec is
  replaced by promisified `node:timers/promises` `setTimeout` so the leaf
  package stays dependency-light.
- The redis driver's two-node spec follows `RedisLockDriver`'s live-lane
  template byte-for-byte (skip without `NDIGO_REDIS_TEST_URL`, `afterEach`
  SCAN+DEL cleanup under `ndigo:rl:<namespace>:*`), adding a same-namespace
  second-connection budget test that the memory driver cannot have.

## Risks

- **Fail-open adoption**: teams copy-pasting the `onError: 'fail-open'`
  option for convenience get unthrottled requests during outages. The
  default is fail-closed; the guide calls the tradeoff out in the driver's
  own docs.
- **Retry-After on clock skew**: `PTTL` is server-clock, `Date.now()` is
  client-clock; skew only shifts the exact remainder value, never the
  deny decision (the counter is server-side truth). Same posture note as
  the lock driver's `expiresAt` caveat.
- **`PTTL` edge**: a key whose TTL was externally cleared could return
  `-1`; the driver clamps `retryAfterMs` to ≥ 0 (the interceptor floors
  `Retry-After` at 1 s), and the deny decision itself is unaffected.
- **Namespace collisions**: `ndigo:rl:<ns>:` is a convention, not
  authorization — the AD-40 doctrine (protect Redis with ACLs and trusted
  network) applies unchanged.

## References

- `docs/plans/2026-10-07_CODE_REVIEW_AND_MITIGATION.md` §6 GAP-8 row,
  §8 Wave-6 capacity track ("GAP-8/9/13 … as capacity work"), §10
  deferred table.
- AD-33 (rate limiting, SEC-6), AD-37 (trusted-proxy keying), AD-39
  (async by default), AD-73 (leaf-SPI topology + `@ndigo/redis/locks`
  driver + token bean), AD-34 (TypeScript-native tokens), AD-40
  (`@ndigo/redis` connection/namespace doctrine), AD-67 (`@ndigo/log`
  leaf).
- Companion plan: `docs/plans/2026-10-08_SHARED_STORE_RATE_LIMITING.md`;
  guide 11 §5 and guide 16 updated at execution.
