# AD-22: WebSocket Client & the `@ndigo/socket` Package

**Date:** 2026-09-15
**Status:** Accepted — decision recorded; implementation sequenced (see
[plan](../plans/2026-09-15_WEBSOCKET_CLIENT.md))

## Background

AD-21 delivered the server surface: `@socketMapping`, `SocketSession` rooms,
broadcast, heartbeat. The framework still has **no client story** — an
application cannot connect to a room, observe connection state, or survive
an interrupted network. The framing question this ADR settles: where does a
socket _client_ live — a platform package (browser-only) or its own
package?

The decisive fact: **WHATWG `WebSocket` is a global in browsers _and_ Node
≥22** (undici ships it) — the same interface surface on both runtimes,
exactly like `fetch`. A client written against it is isomorphic. The repo's
boundary rule (AD-04 / `no-browser-globals-in-isomorphic`) says browser-only
code lives in `ndigo-platform-web`; an isomorphic abstraction does **not**
belong there, and it is not HTTP (so not `ndigo-http`). The client is also a
**second surface** of the socket domain (server contract + client
abstraction sharing message framing and close semantics) — that is the
trigger for a domain package.

## Decision

### D1 — New isomorphic package `@ndigo/socket`

`@ndigo/socket` owns the socket domain:

- **Contracts, moved from `ndigo-dispatcher`** (type-only, zero runtime
  coupling): `SocketSession`, `SocketRequestSources`, `SocketSessionRegistry`.
- **Client**: `SocketClient` contract, `WebSocketClient` implementation
  (WHATWG `WebSocket` global; `ws` fallback not needed — engine is ≥22),
  reconnect policy.

Trigger: the client joins the existing server contract — extraction now is
pre-1.0-cheap (four known consumer files) versus a breaking migration at the
1.0 freeze. Future STOMP and pub/sub work lands in this package (D5).

### D2 — `ndigo-dispatcher` keeps exporting the moved types

Dispatcher imports the contracts from `@ndigo/socket` and re-exports them
from its index: the handler-signature vocabulary stays stable for
`@socketMapping` users, and `parameters.ts` must type the `socketSessionValue()`
extractor against them regardless. This is public-API aggregation, not a
deprecated alias; no handler call sites change. `platform-node` keeps its
server machinery (`NodeSocketSessionRegistry`, adapter) — that is the
platform implementation of the contract, which is where platform glue
belongs.

### D3 — Client semantics

- `status` as a **signal** (`connecting | open | reconnecting | closed`) —
  the locale-signal precedent (AD-19); consumers re-render on change.
- `messages` as an async iterable — contract parity with `SocketSession`;
  `send` parity (strings → text frames, else JSON).
- **Auto-reconnect only on unexpected close**: exponential backoff with
  jitter (base 1s, cap 30s, 0–20% jitter), injectable clock (the
  TaskScheduler precedent, AD-20). A deliberate `close()` never reconnects.
- Optional **bounded outbound queue** while disconnected
  (`bufferWhileDisconnected?: { maxMessages }`) — opt-in, default off;
  flushed on reconnect, overflow drops oldest.
- A **reconnect trigger** seam (signal/emitter) so environment wiring can
  push an immediate retry — the browser `online` event arrives from
  `ndigo-platform-web` (D6), keeping `@ndigo/socket` free of window globals.

### D4 — SockJS: never

SockJS is a pre-2015 fallback-transport workaround (long-polling/flash
shims for browsers without native WebSocket). Nothing to layer on it in
2026; the framework will not implement it. Third-party implementations are
the caller's choice.

### D5 — STOMP: future layer, post-client

STOMP (destinations, subscriptions, frames) is a real future feature,
scheduled after the client lands: client frame codec in `@ndigo/socket`,
server-side in `ndigo-platform-node` (or a socket-server sibling). Not in
this plan's scope.

### D6 — Demo gate

The ndigo-api chat e2e is **rewired through the `@ndigo/socket` client** (Node
global WebSocket against the real app — same wire as a browser), plus unit
tests against a WHATWG-shaped transport double with fake timers. The
browser `online`-event trigger ships as a small `ndigo-platform-web` helper.

## Consequences

- **Layout**: `@ndigo/socket` (contracts + client, isomorphic);
  `ndigo-dispatcher` depends on it (re-exports); `ndigo-platform-node`
  unchanged; `ndigo-platform-web` gains the online-trigger helper.
- **Dependencies**: `@ndigo/socket` → `@ndigo/signals` (status signal);
  dispatcher → socket. Lockfile updates.
- **Deferred, documented**: backpressure policy (separate small follow-up),
  Redis pub/sub backplane (post-1.0, needs a store contract), message
  history/persistence.
- **Docs**: broadcast plan non-goals and the websockets guide §5 updated to
  point at this plan; SockJS recorded as never (D4).

**Decision record:** this ADR. **Implementation plan:**
`docs/plans/2026-09-15_WEBSOCKET_CLIENT.md`.
