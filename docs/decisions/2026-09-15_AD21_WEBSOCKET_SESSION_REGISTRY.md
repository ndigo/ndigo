# AD-21: WebSocket Session Registry — per-kind sessions, context-owned lifecycle

**Date:** 2026-09-15
**Status:** Accepted — decision recorded; implementation sequenced (see
[plan](../plans/2026-09-15_WEBSOCKET_BROADCAST.md))

## Background

WebSockets in ndigo are present but single-connection: `@socketMapping`
handlers bind a `SocketSession` (path/params/sources, async-iterable
messages, `send`/`close`), the Node adapter dispatches upgrades through the
normal radix mapping, and that is the whole story (gap analysis
`docs/audits/2026-09-13_FRAMEWORK_GAP_ANALYSIS.md` §2.3). There is no
broadcast, no rooms, no heartbeat/reaping, no registry — and the
auto-configuration has no socket wiring at all.

Framing the fix surfaced two design questions:

1. **Should there be a generic session type?** `SocketSession`,
   an HTTP session, and `@ndigo/auth-core`'s `Session` share "an ID and a
   data container" — is that enough of a common core for a shared
   interface (possibly in the abstract dispatcher)?
2. **Who owns session machinery?** A Node application can run socket and
   HTTP sessions side by side — is session lifecycle a dispatcher concern
   or application-context composition?

## Decision

### D1 — No generic `Session` base class

`SocketSession` remains a concrete, standalone contract. Industry research
(Appendix A of the plan) shows no framework in any ecosystem unifies HTTP
session state with WebSocket connections by inheritance — including
Micronaut, the closest candidate, whose `WebSocketSession` was verified
against primary API docs to extend an attribute-bag mixin
(`MutableConvertibleValues`) + `AutoCloseable`, **not** its `Session`. The
shared "ID + data container" core is too thin to build a hierarchy on:
every operation past identity splits by lifecycle (logical cross-request
state vs. physical connection lifetime — HTTP: invalidate/rotate/expire/
persist; WebSocket: send/close/ping/reap).

### D2 — Adjectival session naming; `Session` → `AuthSession` in `@ndigo/auth-core`

`@ndigo/auth-core`'s `Session` is the only unqualified session type and
collides by name with the emerging family. Renamed as a standalone prereq
commit (verified blast radius: one consumer — `ndigo-auth-client`'s
`AuthHeaderInterceptor` — plus specs; pre-1.0 breaking is sanctioned).
Family: `AuthSession`/`DefaultAuthSession` (auth state), `SocketSession`
(connection), `HttpSession` (reserved for the M4 session store; not built
now). Package names stay the coarse namespace; adjectives the fine one.

### D3 — Per-kind registry now; shared ID+bag contract deferred to M4

`SocketSessionRegistry` is built per-kind — the industry shape (Socket.IO
rooms, SignalR Groups, Micronaut `getOpenSessions()`). No generic `SessionRegistry<S>` until the HTTP session
store (audit M4) creates a second consumer; when it does, extract the
**ID + attributes-bag** contract (Micronaut-style), not a registry base.
Planted now: `SocketSession.attributes: Record<string, unknown>`
(per-connection state; industry-universal — Micronaut and Jakarta both
expose it).

### D4 — Session lifecycle is application-context-owned

The dispatcher contributes **types only**; registries, heartbeat, and
broadcast are beans registered by `NodeAutoConfiguration` (the AD-20
zero-wiring pattern), with the implementation in `ndigo-platform-node`. A
Node app runs socket sessions and HTTP sessions side by side as separate
beans bound through separate extractors (`socketSessionValue()` /
`requestSessionValue()`) — ordinary DI, no unified session layer. The adapter
keeps owning the `WebSocketServer`; the registry attaches at server start
and is reachable from any service (scheduler → room, HTTP → room).

### D5 — Rooms: auto-join to endpoint path + explicit named rooms

Sessions auto-join their endpoint path (`broadcast('/ws/room', …)` is
zero-setup); finer grouping via `session.join(room)` / `leave(room)` with
registry-backed membership. Broadcast payload parity with `session.send`:
strings → text frames, everything else JSON. Fan-out is best-effort —
closed sessions are skipped, transport write errors tolerated (matching
the adapter's existing error posture).

### D6 — Heartbeat on by default (fail-closed)

Server pings each session every `heartbeatIntervalMs` (default 30s); a
session silent past `idleTimeoutMs` (default 60s, ~2 missed pongs) is
closed `1001` and reaped. Disabling is explicit. Without heartbeats, dead
peers (NAT timeouts, dropped WiFi) accumulate forever — the silent failure
the feature exists to fix.

## Consequences

- **Contracts:** `SocketSession` gains `attributes`/`join`/`leave`
  (additive); new `SocketSessionRegistry` type in `ndigo-dispatcher`
  (unreferenced by the dispatcher's execution path).
- **Implementation:** `NodeSocketSessionRegistry` (membership, rooms,
  broadcast, heartbeat sweep) + adapter registration/removal + graceful
  shutdown close-all.
- **Composition:** `NodeAutoConfiguration` `@entry` bean + configuration
  properties (`socket.heartbeat-interval-ms`, `socket.idle-timeout-ms`).
- **Deferred:** cross-node pub/sub (needs a store contract), STOMP/SockJS,
  client reconnect/backoff (ndigo-platform-web/ndigo-service), generic
  registry — all documented in the plan's non-goals.
- **Demo gate:** ndigo-api `/ws/room` chat + scheduler-driven broadcast.

**Decision record:** this ADR. **Implementation plan:**
`docs/plans/2026-09-15_WEBSOCKET_BROADCAST.md`.
