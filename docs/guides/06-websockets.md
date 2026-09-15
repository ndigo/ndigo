# Guide 06 — WebSockets, Rooms, and Broadcast

How realtime endpoints work in BlueJS: `@socketMapping`, the
`SocketSession` contract, the session registry (rooms + broadcast), and the
heartbeat. WebSockets are served from the same dispatcher as HTTP routes —
same radix mapping, same `@parameters` binding, same Zod validation — with
a **connection** contract instead of a request/response pair (AD-21).

The design: per-kind sessions with no generic base class. The dispatcher
owns the types handlers sign against; the Node platform implements the
machinery; the application context composes it — a Node app can run socket
sessions and HTTP sessions side by side as separate beans bound through
separate extractors (`socketSession()` / `sessionValue()`).

## 1. Quickstart

Add a `@socketMapping` handler to any controller and connect:

```ts
import { parameters, socketMapping, socketSession, type SocketSession } from '@blue/dispatcher';

@requestMapping('/ws')
class ChatController {
    @socketMapping('/echo')
    @parameters({ session: socketSession('session') })
    async *echo(session: SocketSession) {
        for await (const message of session.messages) {
            yield { event: 'echo', data: message };
        }
    }
}
```

The handler is an **async generator**: `session.messages` is an async
iterable of inbound frames, and each yielded value is sent to the peer
(strings as text frames, everything else JSON). The stream ends when the
connection closes.

Upgrade-time facts — query, headers, cookies — are bound like HTTP params
(e.g. `queryValue`, `headerValue`, `cookieValue`), including Zod
validation; route conditions (query params, matrix params) gate the
handshake itself:

```ts
@socketMapping({ value: '/room', queryParams: 'token=abc' })
@parameters({ session: socketSession('session'), token: queryValue('token') })
async *room(session: SocketSession, token: string) { /* … */ }
```

A missing required parameter closes the socket with `1008` (policy
violation); unknown paths refuse the handshake; an `allowedWebSocketOrigins`
adapter option rejects forged origins with `403` before the connection (in
`NodeHTTPServerAdapterOptions`).

## 2. The session registry

`NodeAutoConfiguration` provisions a `socketSessionRegistry` bean
(`SocketSessionRegistry` contract in `@blue/dispatcher`, implementation in
`@blue/platform-node`). The HTTP server resolves it at start, so the bean
**is the adapter's registry** — any service can push to live sessions:

```ts
import { type SocketSessionRegistry } from '@blue/dispatcher';

// any bean: fetch the registry from the context (or inject it)
const registry = context.getValue<SocketSessionRegistry>('socketSessionRegistry');
registry.broadcast('/ws/room', { event: 'server', data: 'maintenance window' });
registry.count('/ws/room');          // 0 if nobody is connected
registry.closeAll(1001, 'bye');      // graceful server shutdown
```

Every session auto-joins a set keyed by its endpoint path, so
`broadcast(path, …)` is zero-setup. Named rooms are the finer grouping:
`session.join('room')` / `session.leave('room')` in the handler, and
`broadcastTo('room', …)` from anywhere. Fan-out is best-effort — closed
sessions are skipped, transport errors tolerated. Backpressure is on by
default: a session whose transport buffer exceeds 1 MiB is closed with
`1013` ("try again later", Spring's `SESSION_NOT_RELIABLE`) — the AD-22
client reconnects and resyncs. Tune per registry:
`{ backpressure: { maxBufferedBytes, onOverflow: 'drop' | 'close' } }`
(`drop` skips silently; `null` disables the guard).

Socket observability ships as `WebSocketServerInstrumentation`
(`@blue/telemetry-node`, opt-in like the HTTP instrumentation): session
lifetime spans (`SocketSession.connect`, path/duration/close code),
sessions opened/closed, fan-out messages/bytes (path/room), and
backpressure-close counters — all under `blue.socket.*`.

Also on the session: `session.attributes` — a per-connection state bag
(Micronaut/Spring/Jakarta parity), and `session.close(code, reason)` for a
server-initiated close.

## 3. Scheduler → room (cross-context push)

The registry is ordinary DI, so scheduled tasks or HTTP handlers can push
into rooms — the `apps/blue-api` demo proves it with a chat room where a
`@scheduled` tick fires every 2 seconds:

```ts
export class ChatController implements ApplicationContextAware {
    get [$aware](): boolean { return true; }
    setApplicationContext(context: ApplicationContext): void { /* … */ }

    @socketMapping('/chat')
    @parameters({ session: socketSession('session') })
    async *chat(session: SocketSession) {
        session.join('room');
        for await (const message of session.messages) {
            this.#registry()?.broadcastTo('room', { event: 'chat', data: String(message) });
        }
    }

    @scheduled('*/2 * * * * *')
    chatTick() {
        this.#registry()?.broadcastTo('room', { event: 'chat-tick', at: Date.now() });
    }
}
```

## 4. Heartbeat

Heartbeats are **on by default** (fail-closed): the registry pings every
session each `heartbeatIntervalMs` (default 30s) and reaps — terminates and
drops — sessions silent past `idleTimeoutMs` (default 60s, ~2 missed
pongs), closing them with `1001`. Dead peers (NAT timeouts, dropped WiFi)
cannot accumulate. Configure via environment:

```
BLUE_SOCKET_HEARTBEAT_INTERVAL_MS=10000   # ping every 10s
BLUE_SOCKET_IDLE_TIMEOUT_MS=30000         # reap after 30s silent
BLUE_SOCKET_HEARTBEAT_INTERVAL_MS=0       # disable explicitly (not recommended)
```

Adapters constructed by hand accept a `NodeSocketSessionRegistry` with the
same options; `server.close()` stops the sweep (graceful shutdown).

## 5. The client (`@blue/socket`, AD-22)

`WebSocketClient` is the isomorphic client: WHATWG `WebSocket` global in
browsers **and** Node ≥22, with signal-based status and reconnect:

```ts
import { WebSocketClient } from '@blue/socket';
import { effect } from '@blue/signals';

const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
    reconnect: { baseMs: 1000, maxMs: 30_000, jitter: 0.2 }, // default
    bufferWhileDisconnected: { maxMessages: 100 },            // opt-in queue
    reconnectTrigger: createOnlineReconnectTrigger(),         // browser wiring
});

effect(() => {
    if (chat.status.value === 'open') connectingBadge.hidden = true;
});

for await (const message of chat.messages) {
    applyMessage(JSON.parse(String(message))); // text frames arrive as strings
}
chat.send({ room: 'lobby', text: 'hello' });   // strings → text frames, else JSON
chat.close();                                   // deliberate — never reconnects
```

Semantics (AD-22 D3): `status` is a signal
(`connecting/open/reconnecting/closed`); `messages` is an async iterable
that **survives reconnects** and completes only on a deliberate `close()`;
unexpected drops back off exponentially (base 1s, cap 30s, ±20% jitter,
attempt counter reset on each successful open); messages sent while
disconnected are queued (opt-in, overflow drops oldest) or dropped.

`createOnlineReconnectTrigger()` (`blue-platform-web`, browser-only) wires
window `online`/`offline` events into the client's immediate-retry path —
the browser half of the story; `@blue/socket` itself has no window globals.

## 6. Design boundaries (AD-21)

- **No generic `Session` base class.** HTTP session state and WebSocket
  connections share only "ID + data container" — every operation past that
  splits by lifecycle. Research appendix in the plan
  (`docs/plans/2026-09-15_WEBSOCKET_BROADCAST.md`): no framework unifies
  them, including Micronaut (whose `WebSocketSession` shares an
  attribute-bag mixin, not a base).
- **Names are adjectival**: `AuthSession` (auth state), `SocketSession`
  (connection), `HttpSession` (reserved for the future session store).
- **Client story**: `@blue/socket` — the isomorphic client package
  (`SocketClient`, reconnect + status signal) — see
  [AD-22](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md) and
  [plan](../plans/2026-09-15_WEBSOCKET_CLIENT.md).
- **Deferred, not built**: cross-node pub/sub (needs a store contract),
  STOMP (future layer), message history — **SockJS: never** (pre-2015
  fallback-transport workaround; third-party territory, AD-22 D4).

## 7. References

- Decision: [AD-21 — WebSocket Session Registry](../decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md),
  [AD-22 — WebSocket Client & `@blue/socket`](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md)
- Plans: [WebSocket Broadcast](../plans/2026-09-15_WEBSOCKET_BROADCAST.md),
  [WebSocket Client](../plans/2026-09-15_WEBSOCKET_CLIENT.md)
- Demo: `ChatController` in `apps/blue-api/src/chat-controller.ts`, e2e in
  `apps/blue-api/test/chat.spec.ts` (driven by `WebSocketClient`)
- Package surfaces: [`@blue/socket`](../../packages/blue-socket/README.md)
  (contracts + client), `@blue/dispatcher` (handler vocabulary),
  [`@blue/platform-node`](../../packages/blue-platform-node/README.md)
  (registry, adapter, auto-configuration), `@blue/platform-web` (online trigger)