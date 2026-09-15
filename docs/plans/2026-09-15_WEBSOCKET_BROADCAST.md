# 2026-09-15 WebSocket Session Registry & Broadcast

**Status:** Proposed (ratification pending — ADR to follow this plan)
**Scope:** `blue-dispatcher` (type-only contracts), `blue-platform-node` (impl, auto-configuration),
`blue-auth-core` (naming prereq), `apps/blue-api` (demo gate)
**Companion docs:** [Framework Gap Analysis](../audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md) §2.3 (WebSockets),
[AD-18 Host Runtime](../decisions/2026-09-13_AD18_HOST_RUNTIME.md), [AD-20 Scheduling](../decisions/2026-09-13_AD20_SCHEDULING.md)

---

## 1. Problem

The gap analysis (`2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §2.3) records WebSockets as
present-but-incomplete:

> `@socketMapping` (RFC 6455), echo/room demos, socket session — no broadcast
> abstraction, no cross-node pub/sub, no heartbeat/reconnect lifecycle.

Concretely, a BlueJS Node app today can accept a WebSocket connection and echo
messages back, but it cannot:

- broadcast one message to many connected clients (the defining WebSocket use case),
- group sessions into rooms/channels,
- detect or reap dead peers (no ping/pong heartbeat),
- gain access to the registry from outside the handler (scheduler → room, HTTP → room),
- get any of this from auto-configuration (the adapter is wired by hand in tests only).

## 2. Current state (verified 2026-09-15)

| Surface | Location | Notes |
| --- | --- | --- |
| `@socketMapping(route)` | `blue-dispatcher/src/socket-mapping.ts` | Method decorator on top of `routeMapping`; per-method socket marker |
| `isSocketMapping()` | same file | `route:socket:<method>` + `route:mapping:<name>` both present |
| `SocketSession` contract | `blue-dispatcher/src/socket-session.ts` | `path/params/query/headers/cookies`, `messages` (async iterable), `closed`, `isClosed`, `send()`, `close(code, reason)` |
| `SocketRequestSources` | same file | `query/headers/cookies` — the upgrade-request vocabulary, shared with the HTTP path |
| `nodeSocketSession()` | `blue-platform-node/src/node-socket-session.ts` | Wraps `ws`; `AsyncReader` bridges push events → async iterable |
| Adapter upgrade path | `node-http-server-adapter.ts` | `shouldHandle` gates by route conditions (query params), origin allowlist fails closed, FIFO pending-upgrades, `#dispatchSocket` binds `@parameters` (incl. Zod; missing required param → close `1008`) |
| Tests | `blue-platform-node/test/websocket.spec.ts` | Echo, unknown-path refusal, query-gated upgrade, origin enforcement |
| Auto-configuration | `node-auto-configuration.ts` | **No socket wiring** — no registry, no options, nothing |

The dispatcher already treats sockets as first-class (parameter binding via the same
machinery as HTTP: `queryValue`, `headerValue`, `cookieValue`, `validatedBy`, plus
`socketSession()`), and the adapter already resolves the socket handler through the
normal radix mapping. The missing layer is *session tracking and fan-out*.

## 3. Architecture: composition-root model

WebSockets are added the same way HTTP sessions are handled in this stack: the
dispatcher defines the **types handlers sign against**, the platform implements the
**machinery**, and the **application context composes** the two. A Node application
runs socket sessions and HTTP sessions side by side as separate beans bound through
separate extractors — no unified "session layer" exists or is proposed.

| Role | Home | Contents | Runtime coupling to dispatcher |
| --- | --- | --- | --- |
| Signature vocabulary | `blue-dispatcher` (type-only) | `SocketSession` (+ `attributes`), `SocketSessionRegistry` contract, extractor types | None — dispatcher execution path never references registries |
| Implementation | `blue-platform-node` | `NodeSocketSessionRegistry` (membership, broadcast, heartbeat sweep), adapter hookup | Implements the contract |
| Composition | `NodeAutoConfiguration` (`@entry` beans, mirroring `TaskScheduler`/`ScheduleRegistry` AD-20) | Registry bean + configuration properties (heartbeat intervals) | Through DI only |
| Application | any app config (e.g. `NodeAppConfiguration`) | Controllers + services inject the registry; nothing to wire | Through DI only |

Coexistence example (the question this model answers — a Node app with both kinds):

```typescript
// blue-api-style app config: nothing socket-specific beyond the auto-config
@configuration
export class NodeAppConfiguration {
    @entry chatController() { return new ChatController(); }   // @socketMapping + socketSession()
    @entry noteController() { return new NoteController(); }    // @getMapping + sessionValue()
}
```

The chat handler binds `SocketSession`; the HTTP handler binds the state bag via
`sessionValue()`; a scheduler-driven task pushes into a room through the injected
`SocketSessionRegistry` bean. All three coexist as ordinary DI.

## 4. Decisions

### D1 — No generic `Session` base class

`SocketSession` stays a concrete, standalone contract. Industry research (Appendix A)
shows no framework in any ecosystem unifies HTTP session state with WebSocket
connections via inheritance — including Micronaut, the closest candidate, whose
`WebSocketSession` extends an attribute-bag mixin (`MutableConvertibleValues`), not
its `Session`. The shared core ("ID + data container") is real but too thin to build
a hierarchy on; every operation beyond identity splits by lifecycle
(logical cross-request state vs. physical connection).

### D2 — Adjectival session naming; rename auth `Session` → `AuthSession`

`Session` in `@blue/auth-core` is the only unqualified session type and collides by
name with the emerging family. Rename it as a standalone prereq commit (verified
blast radius: one consumer — `blue-auth-client/src/auth-header-interceptor.ts` — plus
specs; pre-1.0 breaking changes are sanctioned by the README). Family:

- `AuthSession` / `DefaultAuthSession` — `@blue/auth-core` (principal/token state)
- `SocketSession` — `@blue/dispatcher` (unchanged)
- `HttpSession` — **reserved** for the audit M4 server-side session store; not built here

Package names remain the coarse namespace; adjectives the fine one.

### D3 — Per-kind registry now; shared ID+bag contract deferred to M4

`SocketSessionRegistry` is built per-kind (industry shape: Socket.IO rooms, SignalR
Groups, Micronaut `getOpenSessions()`, Spring `SimpUserRegistry`). No generic
`SessionRegistry<S>` until the HTTP session store (audit M4) creates a second
consumer; when it does, extract the *ID + attributes-bag* contract (Micronaut-style),
not a registry base. Concession planted now: `SocketSession` gains an `attributes`
bag (industry-universal: Micronaut, Spring, Jakarta) — per-connection state without a
store, and the seed of the future shared contract.

### D4 — Registry lifecycle is application-context-owned

Registry, heartbeat, and broadcast are beans registered by `NodeAutoConfiguration`;
`blue-dispatcher` contributes types only. This is the existing auto-configuration
pattern (AD-20 D2: scheduler zero-wiring) and the industry pattern (Spring
`SimpMessagingTemplate`, Micronaut `SessionStore` are context beans). The adapter
still owns the `WebSocketServer`; the registry attaches to it at server start.

### D5 — Rooms: auto-join to endpoint path + explicit named rooms

- Every session auto-joins the set `{ endpoint path }` — `broadcast('/ws/room', …)`
  needs zero setup.
- Explicit grouping via `session.join('room')` / `session.leave('room')`; registry
  stores membership, session exposes the ergonomic surface.
- Broadcast payload parity with `session.send`: strings → text frames, everything
  else JSON-encoded.
- Best-effort fan-out: sessions closed mid-broadcast are skipped; transport write
  errors are tolerated (matching the adapter's `websocket.on('error')` no-op posture).

### D6 — Heartbeat on by default, fail-closed like the origin allowlist

Server pings each session every `heartbeatIntervalMs` (default 30 000); a session
that misses `idleTimeoutMs` (default 60 000, i.e. ~2 missed pongs) is closed `1001`
and reaped. Both configurable via adapter/registry options; disabling is explicit.
Rationale: without heartbeats, dead peers (NAT timeouts, dropped WiFi) accumulate
forever — the silent failure this feature exists to fix.

## 5. Surface

### `blue-dispatcher` — type-only additions

```ts
// socket-session.ts — additive
interface SocketSession {
    // …existing members…
    /** Per-connection state bag; cleared on close (Micronaut/Spring parity, D3). */
    readonly attributes: Record<string, unknown>;
    /** Join a named room. Membership is registry-backed; no-op after close. */
    join(room: string): void;
    /** Leave a named room. No-op after close. */
    leave(room: string): void;
}

// new: socket-session-registry.ts (contract only — nothing in the dispatcher's
// execution path references it)
interface SocketSessionRegistry {
    sessions(path: string): readonly SocketSession[];   // auto-join set
    count(path: string): number;
    broadcast(path: string, payload: unknown): void;      // auto-join set
    broadcastTo(room: string, payload: unknown): void;    // explicit rooms
    join(session: SocketSession, room: string): void;     // registry-backed membership
    leave(session: SocketSession, room: string): void;
    closeAll(code?: number, reason?: string): void;
    /** Removes + closes a session; called by the transport on close. */
    remove(session: SocketSession): void;
}
```

### `blue-platform-node` — implementation

- `NodeSocketSessionRegistry implements SocketSessionRegistry` — `Map<session, path>`
  + `Map<room, Set<session>>`; register happens in the adapter's `#dispatchSocket`
  before handler invocation, remove on `closed` completion (both paths: peer close
  and server close), heartbeat sweep (`ws.ping()` + pong tracking + terminate).
- Adapter: construct/accept the registry (from context at server start, mirroring
  how `HTTPServer` resolves the dispatcher); wire `attributes`/`join`/`leave` through
  `nodeSocketSession`.
- `NodeAutoConfiguration`: `@entry socketSessionRegistry()` bean + configuration
  properties (`socket.heartbeat-interval-ms`, `socket.idle-timeout-ms`).
- `HTTPServer` start passes registry + options to the adapter; stop closes all
  sessions (graceful shutdown integration).

## 6. Phases

### Phase 0 — Prereq: `AuthSession` rename (small, isolated commit)

- Rename `Session` → `AuthSession`, `DefaultSession` → `DefaultAuthSession` in
  `blue-auth-core/src/session.ts`; update `index.ts` exports and consumers
  (`blue-auth-client/src/auth-header-interceptor.ts`, specs).
- Commit message: `refactor(auth-core): rename Session to AuthSession (WS session naming, D2)`.

### Phase 1 — Contracts (blue-dispatcher)

- Add `attributes`, `join`, `leave` to `SocketSession`; update `nodeSocketSession`
  and test doubles.
- Add `SocketSessionRegistry` contract + `index.ts` export.
- Tests: contract-shape unit tests (matching `socket-session` conventions).

### Phase 2 — Implementation (blue-platform-node)

- `NodeSocketSessionRegistry` with membership, rooms, broadcast, close-all, heartbeat
  sweep (fake timers), error tolerance.
- Adapter hookup: register on connection, remove on close, session passthrough.
- Extend `websocket.spec.ts` style e2e: two clients + broadcast, room join/leave,
  heartbeat reaping, close-all on server stop.

### Phase 3 — Auto-configuration

- `NodeAutoConfiguration` `@entry` registry bean + environment options
  (`BLUE_SOCKET_HEARTBEAT_INTERVAL_MS`, `BLUE_SOCKET_IDLE_TIMEOUT_MS`; D6
  defaults — resolved via `resolveSocketRegistryOptions`, the
  `resolveHTTPRequestLimits` pattern).
- `HTTPServer`/adapter wiring: the server resolves the registry bean at
  start, so bean broadcasts reach adapter sessions (one shared instance);
  graceful shutdown closes sessions and stops the sweep.
- Spec: bean present in a booted context; options flow through.

### Phase 4 — Demo gate (apps/blue-api)

- `@socketMapping('/ws/chat')` chat: any client message broadcasts to the
  room; everyone joins the `room` group on connect.
- Scheduler-driven push: `ChatController` itself carries a `@scheduled`
  tick broadcasting into the room every 2s (controller-parked task, AD-20
  D1) — proving registry reachability from outside handlers with
  zero-wiring. (The AD-20 `Heartbeat` bean stays the scheduling demo.)
- e2e (Playwright-style or `blue-test` harness): two sockets, message fan-out,
  scheduler tick received.
- Docs: `docs/guides/06-websockets.md` + plans README index (this doc).

## 7. Verification

Per phase: package `pnpm test`, `pnpm lint`, `pnpm format:check`, root `pnpm build`.
Phase 4 gate additionally runs the blue-api e2e. No generic-registry or
session-base abstractions are introduced (D1/D3 guardrails).

## 8. Non-goals / deferred (documented, not built)

- Cross-node pub/sub (Redis-backed fan-out) — needs a store contract; revisit post-1.0.
- STOMP/SockJS subprotocols — STOMP is a future layer (AD-22 D5); **SockJS is
  never** (pre-2015 fallback-transport workaround — AD-22 D4, third-party territory).
- Client-side reconnect/backoff — **now its own feature**: `@blue/socket`
  client package, see [2026-09-15_WEBSOCKET_CLIENT.md](2026-09-15_WEBSOCKET_CLIENT.md) + AD-22.
- Message persistence/history. (Backpressure: **implemented 2026-09-15** —
  `SocketBackpressurePolicy` on the registry: 1 MiB watermark, `close` `1013`
  / `drop`, enabled by default.)
- Generic `SessionRegistry<S>`; shared ID+bag contract — deferred to audit M4
  (HTTP session store), which also reserves the `HttpSession` name (D2).

## 9. Risks & open questions

| Risk | Mitigation |
| --- | --- |
| Broadcast fan-out races with close | `remove()` is idempotent; broadcast skips `isClosed`; best-effort (D5) |
| Heartbeat sweeps interfere with active low-traffic sessions | `ws` pong tracking is per-connection; pings do not consume application frames |
| Registry bean lifetime vs server restart | Registry cleared on context close (Phase 3 graceful shutdown) |
| `Session` → `AuthSession` rename churn | Verified single consumer + specs; isolated commit (Phase 0) |

Open: none blocking. Alternative considered and rejected: hosting the registry
contract in `blue-platform-node` (rejected — `SocketSession` contract precedent in
`blue-dispatcher`, D4).

## 10. References

- Gap analysis: `docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §2.3
- Exact seams: `packages/blue-dispatcher/src/socket-session.ts`, `socket-mapping.ts`;
  `packages/blue-platform-node/src/node-http-server-adapter.ts` (`#dispatchSocket`),
  `node-socket-session.ts`, `node-auto-configuration.ts`; `apps/blue-api/src/node-app-configuration.ts`
- Existing tests: `packages/blue-platform-node/test/websocket.spec.ts`

---

## Appendix A — Session-model industry research (2026-09-15)

Sources: Micronaut primary API docs (read 2026-09-15), Spring Session reference,
framework documentation via web search.

| Framework | HTTP session | WebSocket | Shared base? |
| --- | --- | --- | --- |
| Spring | `HttpSession` (servlet) / `WebSession` (WebFlux) — cross-request **state store** | `WebSocketSession` — **connection**; Spring Session *bridges* by ID ("keep the HttpSession alive when receiving WebSocket messages") | No common supertype |
| Micronaut | `io.micronaut.session.Session` (store-shaped: `put/get/remove/isExpired/expire`) + `SessionStore<T>` | `WebSocketSession` — verified: extends `MutableConvertibleValues<Object>` (attribute bag) + `AutoCloseable`; **not** `Session`; has `getId/getOpenSessions` | No inheritance; shared piece is a value-map mixin |
| Java EE / Jakarta | `HttpSession` | `jakarta.websocket.Session` + `getUserProperties()` | Separate |
| ASP.NET Core | `ISession` (middleware, cookie-backed) | SignalR — `HubCallerContext`/`Groups`/`IClientProxy` | Separate models |
| NestJS / AdonisJS | express-session / `@adonisjs/session` | Socket.IO adapter / `@adonisjs/websocket` channels | Separate packages |
| Rails / Django / Go / Ktor | Cookie/store sessions | ActionCable / Channels / gorilla-websocket / Ktor WS | Separate |

Patterns: (1) HTTP session = logical state outliving connections; (2) WebSocket
session = connection envelope + attribute bag; (3) membership/registry is
per-technology (Socket.IO rooms, SignalR Groups, Micronaut `getOpenSessions()`,
Spring `SimpUserRegistry`). Cross-cutting state (auth principal on a socket) is
**attached, not inherited** — Micronaut Security injects `Authentication` into
`@OnOpen`; Spring keys STOMP by user. Separation persists in frameworks designed
after WebSockets were mainstream (SignalR 2018, Phoenix Channels 2015, NestJS 2019),
so it is structural (lifecycle), not merely historical accretion. Consequences for
BlueJS: D1 (no base class), D3 (per-kind registry; attribute bag), D4 (context-owned
lifecycle).