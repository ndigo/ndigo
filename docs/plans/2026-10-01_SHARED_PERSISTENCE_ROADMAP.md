# 2026-10-01 Shared Persistence and Distributed Backends Roadmap

**Status:** Complete (2026-10-03) — Phases 0–3 implemented, Phase 4 decision recorded, Phase 5 review closed. See [AD-40](../decisions/2026-10-01_AD40_PERSISTENCE_BASELINE.md) and [AD-41](../decisions/2026-10-03_AD41_DISTRIBUTED_SCHEDULING_DEFERRED.md).
**Scope:** Close the deferred persistent/distributed backend seams across sessions, STOMP message storage, caching, WebSocket cross-node fan-out, and scheduled jobs. Deliver in dependency order, validating each contract against the real consumer before extracting common infrastructure.
**Related:** [Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md), [Caching](2026-09-17_CACHING.md), [Auth Completion](2026-09-26_AUTH_COMPLETION.md), [WebSocket Broadcast](2026-09-15_WEBSOCKET_BROADCAST.md), [AD-20 Scheduling](../decisions/2026-09-13_AD20_SCHEDULING.md), [AD-22 WebSocket Client](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md).

---

## 1. Goal and constraints

Provide durable state where restart survival is the requirement, and shared coordination where multiple processes must observe the same state. Keep the current package-owned interfaces (`SessionStore`, `QueueMessageStore`, `Cache`, WebSocket registry/fan-out seam, scheduler seam) as consumer contracts. Do not introduce a universal persistence framework or force a backend choice on applications.

**Backend strategy:**

- **LibSQL** for durable records and ordered message persistence where its SQL transaction model fits. Reuse the existing `LibSQLQueueMessageStore` and existing Drizzle/LibSQL dependency; do not duplicate client ownership or connection lifecycle rules.
- **Redis** only for semantics that need shared low-latency state/coordination (distributed cache, pub/sub, and potentially scheduler coordination). Add a Redis client dependency only when the first Redis-backed phase is approved; keep it behind package-local adapters and make ownership/disposal explicit.
- **In-memory implementations remain** the default/reference implementations for local development and tests.
- **No Redis/LibSQL cross-product matrix**: implement a backend only where it is a meaningful fit. In particular, caching may use either backend only if a consumer need justifies the extra adapter; WebSocket fan-out requires pub/sub semantics, not merely a durable table; scheduler persistence/coordination is not implied by a job table.

**Cross-cutting invariants:**

- Store errors remain visible to consumers; never silently downgrade a requested durable/distributed mode to memory.
- Define ordering, atomicity, TTL/expiry, duplicate/retry, concurrency, and close semantics per contract before adding an adapter.
- Resource ownership is explicit: internally-created clients are closed by the adapter; injected clients are closed only under an explicit ownership option/contract. `close`/`dispose` must be idempotent and integrated with application shutdown where the adapter is container-managed.
- Avoid framework-specific configuration leaking into contract packages; auto-configuration is opt-in or explicitly configured for external services and never silently connects to localhost.
- Integration tests use isolated ephemeral stores and assert consumer-visible cross-instance behavior, not just adapter forwarding.

## 2. Inventory and current seams

| Capability                   | Existing seam / implementation                                                                                                                              | Remaining work                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Session persistence          | `SessionStore`; memory default; completed `LibSQLSessionStore` with explicit initialization, atomic expiry-preserving rotation and owned/borrowed lifecycle | Redis session adapter only if a concrete consumer requires it; not part of the completed cache phase.                                                                                                                                             |
| STOMP durable messages       | `QueueMessageStore`; memory default; completed LibSQL lifecycle baseline and `LibSQLQueueMessageStore` persistence/history                                  | Cross-node queue consumption/coordination is not implemented; any Redis store decision is independent of live pub/sub.                                                                                                                            |
| Generic cache                | Awaitable `Cache`/`CacheManager`; memory default; completed `@blue/redis/cache` shared backend                                                              | Additional backend only for demonstrated need; Redis per-cache eviction is not supported.                                                                                                                                                         |
| WebSocket cross-node fan-out | Completed `SocketFanout`, `@blue/redis/pubsub`, opt-in Node path/room and STOMP topic delivery                                                              | Live-only, no replay/reconnect/global ordering/exactly-once; sockets/membership and queues/users remain local.                                                                                                                                    |
| Scheduled jobs               | `ScheduleRegistry` / `TaskScheduler`; in-process single-flight                                                                                              | Define whether the requirement is persisted schedule metadata, queued durable jobs, or distributed single-flight. These are distinct features. Implement only the requested scheduler persistence/coordination contract, not a generic job queue. |

## 3. Dependency-aware delivery order

### Phase 0 — Contract and lifecycle baseline

Before backend work, pin the existing guarantees and identify truly shared prerequisites. Inspect the live `LibSQLQueueMessageStore` code and current review findings (including historical RT-2) rather than carrying old status forward. Make only demonstrated fixes.

**As built:** Historical RT-2 already had a dispose seam. Fixed shared-client ownership: injected clients are borrowed unless `ownsClient: true`; disposed stores reject further operations. Schema failures remain observable without an unhandled initialization rejection. Added real file-backed close/reopen and backend-failure coverage. AD-40 records Redis client/version/package choices and lifecycle limitations; no Redis dependency added.

**Acceptance:**

- A short ADR records cross-cutting client ownership, shutdown, namespacing, configuration and error policy.
- Existing contracts have explicit lifecycle/error semantics; no incompatible contract rewrite is bundled with backend implementation.
- `LibSQLQueueMessageStore` construction, injected-client ownership, close/dispose, append/replay/prune and failure paths are covered by deterministic tests; any identified defect is fixed before reuse.
- A dependency decision names the selected Redis client, supported Redis version/capabilities, and package placement before adding it.

### Phase 1 — LibSQL session store (first consumer of durable state)

Add `LibSQLSessionStore` in the persistence-friendly package selected by dependency review (likely `blue-orm-drizzle`, while keeping `SessionStore` in `blue-auth-core`). Use a schema/table owned or explicitly supplied by the application; do not silently migrate or drop application tables. Persist only the session fields required by the contract and use parameterized SQL.

**As built (2026-10-01):** `LibSQLSessionStore` in `blue-orm-drizzle` — explicit idempotent `initialize()` (table + expiry index, no migration of app tables), strict `Principal` decode (malformed records reject, never auth-miss), atomic rotation via a single conditional `UPDATE … WHERE session_id = ? AND expires_at > ?` (exactly one contender wins; absolute expiry preserved and reported), live-session cap enforced in the same write batch, expired-row purge on access/create, owned/borrowed client semantics, and `close()` as the container `Closeable` bridge (exactly-once close of owned clients). `intMode: 'number'` is a documented requirement for injected clients (strict decode rejects bigint/string modes). Real `CredentialsAuthAdapter` validate/refresh/logout compose over it in regression coverage; the in-memory store remains the default.

**Acceptance:**

- Two store instances on one database observe create/get/rotate/delete consistently.
- TTL is enforced on reads; expired sessions cannot authenticate; rotation invalidates the old id atomically and returns the new id.
- Restart persistence, concurrent rotate behavior, malformed/missing records, database faults and disposal are tested.
- Node shutdown closes owned resources exactly once; injected-client ownership follows the explicit policy.
- In-memory session behavior remains unchanged and is still the default.

### Phase 2 — Redis client/lifecycle foundation and cache adapter

First migrate the synchronous cache contract and all consumers to an awaitable API under AD-39: Redis cannot implement synchronous reads/writes. Decide supported serialized values and synchronous consumer behavior before the cutover; no parallel `AsyncCache` interface or local-snapshot fallback. Then introduce the smallest reusable Redis connection/configuration/lifecycle component in `@blue/redis` and implement the cache adapter against the migrated contract. See AD-40 for client and server-version selection.

**Async prerequisite as built:** `Cache` data operations now return promises, with `size()` replacing the synchronous getter. Manager acquisition remains a synchronous local handle lookup. `memoize` always returns a promise; `@cached` requires Promise-returning methods. All consumers await data I/O. Single-flight is scoped to the actual store and lasts through the write; read faults reject and decorator write faults keep the documented best-effort warning policy. This changes no default backend and adds no Redis dependency. Remote value serialization remains a Redis-adapter decision: memory retains arbitrary values without JSON conversion.

**Redis as built (2026-10-01):** Node-only `@blue/redis` pins the verified
`@redis/client` 6.3.0 base client. The root exposes explicit `RedisConnection`
lifecycle; `/cache` exposes `RedisCache`/`RedisCacheManager` with optional cache
and factory peers. Explicit URL-created clients are owned, with no automatic
reconnect/offline queue; injected ready clients are borrowed. Awaited idempotent
close rejects new operations, drains accepted work and closes owned sockets.
The synchronous context teardown does not await this hook: applications stop
consumers and await the manager before closing the context.

Cache values use a versioned JSON-value envelope plus whole-entry undefined;
unsupported JS values and corruption reject rather than losing fields or
becoming misses. Positive fractional TTL rounds upward to milliseconds and
expiry uses the Redis server clock. Namespaces encode app/environment, cache
name and key independently, including glob characters and lone surrogates.
Clear uses namespace SCAN and bounded DEL, never FLUSHDB; size deduplicates
SCAN and counts live keys with bounded EXISTS. Both bulk operations require
quiescent writers for stable results, not an atomic snapshot. Per-cache
maxSize/LRU/FIFO is explicitly unsupported rather than silently simulated.

Parent verification observed 55 tests passing (10 real Redis plus 45 cache),
the Redis package build passing, and a real Redis 7.2.16 smoke passing shared
visibility, undefined/miss, TTL, overwrite/delete, namespace isolation,
serialization rejection and awaited owned-client shutdown. Live tests cover
corrupt data, WRONGTYPE, borrowed lifecycle, CLIENT KILL socket loss and startup
SELECT failure. The proof-only smoke was removed after verification. Memory
auto-configuration remains unchanged. At the Phase 2 checkpoint no pub/sub or
scheduler adapter had landed; Phase 3 below subsequently adds live pub/sub.

**Acceptance:**

- Multiple adapter instances share values and expiry; TTL, overwrite, missing values, delete and clear semantics match the contract.
- Serialization is explicit and safe for supported values; unsupported/corrupt values fail visibly. No implicit JSON round-trip claims for arbitrary JS objects.
- Namespace/prefix prevents collisions between apps/environments; reconnect and command failures have documented behavior and are never converted into cache misses unless the caller selected that policy.
- Client lifecycle, secrets/config binding, graceful shutdown and real-Redis integration tests are covered. In-memory cache remains default.

### Phase 3 — Redis WebSocket/STOMP cross-node fan-out

Add a transport-neutral pub/sub contract at the `blue-socket` seam and Redis implementation in a platform/adapter package consistent with dependency direction. Each process subscribes to shared topics and fans messages only to its local sessions. Keep `QueueMessageStore` persistence/replay separate; do not claim exactly-once delivery or durable pub/sub.

**As built (2026-10-03):** `SocketFanout` in `@blue/socket` exposes async
subscribe/unsubscribe and publish for `path | room | topic`, with serialized
`string | Uint8Array` bodies and optional string headers. `RedisSocketFanout`
in `@blue/redis/pubsub` borrows the root publisher connection and owns a
separate URL-created subscriber; random origins suppress its own Redis echo.
One consumer per scope per transport permits one registry and one broker to
share it. Nodes agree on namespace and envelope schema.

`NodeSocketSessionRegistry({ fanout })` subscribes paths/rooms;
`StompBroker({ fanout })` subscribes only `/topic/*`. Await publisher, transport,
registry and broker `connect()` before serving. `HTTPServer`'s explicit
`socketRegistry` option shares the registry with its default adapter; no magic
bean registration or Redis startup is added. Registry broadcasts now return
promises and callers await them. Topic publish/SEND is awaitable; failures
reject before local delivery, with inbound STOMP ERROR followed by close
`1011`, never local-only fallback. Queues/users, membership and MESSAGE/ACK IDs
remain node-local; `QueueMessageStore` persistence/replay stays separate.

Delivery is live at-most-once with no reconnect/offline queue/replay, global
ordering or exactly-once guarantee. Publish completion means Redis acceptance,
not client delivery. Namespace is 1–128 safe ASCII characters; complete JSON
envelopes default to 1 MiB including base64/header overhead, with bounded
keys/headers. Malformed inbound envelopes are dropped and observable through
`lastError`. See [guide 06](../guides/06-websockets.md#cross-node-live-fan-out-opt-in)
for precise limits and trusted Redis ACL/deployment requirements. Stop producers,
close serving, await consumer unsubscribe, transport subscriber close and owner
publisher close before synchronous context teardown; cleanup remains
owner-managed, idempotent and observable on failure.

**Parent verification:** 311 tests passed across socket/Redis and scoped Node
WebSocket/registry/STOMP tests; sequential socket/platform-node/Redis builds,
scoped type-aware lint and manifests passed. The real two-node HTTP/WebSocket
smoke against Redis 7.2.16 reported `PHASE3_FANOUT_SMOKE_OK` with 13 PASS results
covering origin/remote path and room text/binary, unknown-key isolation, STOMP
SEND/topic/binary, node-local queues, closed-publisher rejection and inbound
ERROR/1011 without fallback, and idempotent resource closure. The proof-only
smoke was removed and disposable Redis server stopped. No scheduler phase was
started.

**Acceptance:**

- Two independently constructed brokers/registries connected through Redis deliver a published room/destination message to local subscribers on both instances, without echoing duplicate delivery to the publishing instance beyond the documented contract.
- Subscribe/unsubscribe and shutdown release subscriptions and clients; reconnect behavior, ordering scope, payload limits, duplicate handling and publish failures are explicit.
- A Redis outage is visible; no silent local-only mode unless explicitly configured.
- Existing single-process broadcasts and LibSQL message persistence continue to work independently.

### Phase 4 — Distributed scheduling/job semantics decision, then adapter

Do not start with Redis or LibSQL implementation. First ratify a focused ADR that distinguishes: (a) schedule definition persistence, (b) durable queued executions/retries, and (c) distributed leader/single-flight coordination. Choose only the semantics required by a concrete consumer. If selected, implement the narrow contract/adapter behind `@blue/scheduler`; avoid importing BullMQ unless the chosen requirements specifically need its queue semantics.

**Decision (2026-10-03):** no adapter — see [AD-41](../decisions/2026-10-03_AD41_DISTRIBUTED_SCHEDULING_DEFERRED.md). Every real `@scheduled` consumer is a per-node demo; the engine already documents single-flight, `maxRunTime` release-without-cancel, no catch-up, and AD-20 gates a persistent/multi-process adapter on a revisit trigger that has not fired. Constructing durable jobs or a global singleton now would be speculative generality against the cross-node intent that Phase 3 fan-out already covers. Conditional acceptance (a)–(c) is closed as not-applicable; revisit triggers are recorded for a future concrete worker requirement.

**Acceptance (conditional on the ADR selecting scope):**

- Document restart/redeploy behavior, missed-run/catch-up policy, overlap/lease expiry, crash recovery, idempotency, timezone semantics and multi-worker guarantees.
- Multi-process tests prove one execution or the specified delivery guarantee under contention and worker loss using the chosen ephemeral backend.
- Existing in-process scheduler remains the local default; external backend is explicit and fails startup or execution visibly when unavailable.

### Phase 5 — Backend selection and coverage review

Review whether a Redis-backed `QueueMessageStore` or LibSQL-backed cache is needed based on actual use cases; do not implement both merely for symmetry. Update the audit, guides, decision records and package docs with landed status and remaining limits.

**Review complete (2026-10-03):** no additional backends are justified. A Redis `QueueMessageStore` would duplicate the durable ordered-store role that `LibSQLQueueMessageStore` already fills; a LibSQL cache would duplicate `RedisCache`'s shared-store role without adding a consumer; both were specifically excluded by the no-matrix non-goal. The audit's session/cache/broker-WebSocket/scheduler rows now distinguish implemented adapters from documented deferrals (cross-node queue consumption/history, distributed scheduling per AD-41), each guide's limits are applied, and every implemented phase passed real-backend integration tests plus type/build/lint/format/manifest gates.

**Acceptance:**

- The framework gap audit's session, cache, broker/WebSocket and scheduling rows distinguish implemented adapters from remaining deferrals.
- Each backend guide states topology assumptions, failure behavior, deployment requirements, ownership and shutdown.
- Package tests, cross-instance integration tests, type/build/lint/format gates and a live smoke against real LibSQL/Redis pass for every implemented phase.

## 4. Suggested execution order and rationale

1. **Phase 0 baseline** — prevents historical review notes from becoming incorrect work and establishes shared lifecycle rules.
2. **Phase 1 LibSQL sessions** — directly closes the audit's explicit durable-session gap using the repo's existing SQL integration, without first requiring a new Redis dependency.
3. **Phase 2 Redis foundation + cache** — introduces Redis once for the first concrete shared-state consumer and establishes client/config/shutdown conventions.
4. **Phase 3 Redis pub/sub** — reuses the Redis lifecycle work, while adding a separate delivery contract for real cross-node fan-out.
5. **Phase 4 scheduler semantics** — last because persistence, a queue, and distributed coordination are not interchangeable; specify the need before choosing Redis/BullMQ/SQL.
6. **Phase 5 optional adapter matrix review** — add no backend without a documented consumer need.

Phases 1 and 2 are separate backend foundations and could be implemented independently, but the default sequence puts the existing LibSQL path first and delays a new infrastructure dependency until the Redis-specific use case is reached. Phases 3 and 4 depend on Phase 2 only if Redis is selected. No shared generic store package is planned unless two concrete adapters prove they need the same abstraction.

## 5. Non-goals

- Replacing or unifying existing package contracts with a universal persistence API.
- Making external services mandatory for framework startup or changing in-memory defaults.
- Exactly-once messaging, global ordering across destinations, or cross-node WebSocket session ownership.
- Building a general-purpose durable job queue as a side effect of scheduler storage.
- Implementing Redis and LibSQL adapters for every contract for symmetry alone.
- Broad audit cleanup unrelated to the capabilities above.
