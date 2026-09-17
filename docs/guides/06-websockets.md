# Guide 06 — WebSockets, Rooms, Broadcast, and STOMP

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
registry.count('/ws/room'); // 0 if nobody is connected
registry.closeAll(1001, 'bye'); // graceful server shutdown
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
(`drop` skips silently; `null` disables the guard). The decision is
memoized per session — a close handshake in flight never re-fires the
decision on later broadcasts — and every decision (close and drop) is
observable via the registry's `onOverflow` observer
(`addOverflowObserver(event)` for post-construction wiring, e.g.
telemetry).

Inbound is bounded too: the adapter sets `ws` `maxPayload` (frame size,
default 1 MiB) and each session's inbound queue caps at
`maxQueuedMessages` (default 1024), closing `1009` on overflow — the
inbound mirror of the outbound watermark. Tune per adapter or by env:

```
BLUE_SOCKET_MAX_PAYLOAD_BYTES=1048576       # frame payload cap (default 1 MiB)
BLUE_SOCKET_MAX_QUEUED_MESSAGES=1024        # inbound queue cap per session (default 1024)
```

Socket observability ships as `WebSocketServerInstrumentation`
(`@blue/telemetry-node`, opt-in like the HTTP instrumentation): session
lifetime spans (`SocketSession.connect`, path/duration/close code),
sessions opened/closed, fan-out messages/bytes (path/room), and
backpressure counters (`close` and `drop` actions) — all under
`blue.socket.*`.

Also on the session: `session.attributes` — a per-connection state bag
(Micronaut/Spring/Jakarta parity), and `session.close(code, reason)` for a
server-initiated close. The adapter's optional `authenticate(sources)`
hook runs before the handler: return an object to populate
`session.attributes` (the identity binding — e.g. `{ principal }`), or
`null` to reject the upgrade with `1008`.

## 3. Scheduler → room (cross-context push)

The registry is ordinary DI, so scheduled tasks or HTTP handlers can push
into rooms — the `apps/blue-api` demo proves it with a chat room where a
`@scheduled` tick fires every 2 seconds:

```ts
export class ChatController implements ApplicationContextAware {
    get [$aware](): boolean {
        return true;
    }
    setApplicationContext(context: ApplicationContext): void {
        /* … */
    }

    @socketMapping('/chat')
    @parameters({ session: socketSession('session') })
    async chat(session: SocketSession) {
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
session each `heartbeatIntervalMs` (default 30s) and reaps — closes with
`1001` — sessions silent past `idleTimeoutMs` (default 60s, ~2 missed
pongs). Any inbound traffic (a message) refreshes liveness, and peers that
never finish the close handshake are force-reaped by ws's own
`closeTimeout`. Dead peers (NAT timeouts, dropped WiFi) cannot accumulate.
Configure via environment:

```
BLUE_SOCKET_HEARTBEAT_INTERVAL_MS=10000   # ping every 10s
BLUE_SOCKET_IDLE_TIMEOUT_MS=30000         # reap after 30s silent
BLUE_SOCKET_HEARTBEAT_INTERVAL_MS=0       # disable explicitly (not recommended)
```

Adapters constructed by hand accept a `NodeSocketSessionRegistry` with the
same options; `server.close()` stops the sweep (graceful shutdown).

Socket handlers may be async generators (yield outbound) **or** plain
async functions that consume `session.messages` and push via the registry
(the broadcast style above). Both are awaited and their failures close the
session with `1011` — never an unhandled rejection.

## 5. WebSocket origins (CSWSH)

WebSocket upgrades are plain HTTP GETs that carry cookies; CORS does not
apply, so a malicious page can open a cross-origin socket unless origins
are validated. The adapter's `allowedWebSocketOrigins` option rejects
forged or missing `Origin` headers with `403` before the connection fires
(fail-closed). The `HTTPServer` default-adapter path reads the same list
from `BLUE_SOCKET_ALLOWED_ORIGINS` (comma-separated bare origins,
e.g. `https://app.example,https://admin.example`). When unset, any origin
may upgrade — the explicit public-socket posture (the demo chat room is
intended to be open). Production deployments binding credentials to
sockets should set it.

## 6. The client (`@blue/socket`, AD-22)

`WebSocketClient` is the isomorphic client: WHATWG `WebSocket` global in
browsers **and** Node ≥22, with signal-based status and reconnect:

```ts
import { WebSocketClient } from '@blue/socket';
import { effect } from '@blue/signals';

const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
    reconnect: { baseMs: 1000, maxMs: 30_000, jitter: 0.2 }, // default
    bufferWhileDisconnected: { maxMessages: 100 }, // opt-in queue
    reconnectTrigger: createOnlineReconnectTrigger(), // browser wiring
});

effect(() => {
    if (chat.status.value === 'open') connectingBadge.hidden = true;
});

for await (const message of chat.messages) {
    applyMessage(JSON.parse(String(message))); // text frames arrive as strings
}
chat.send({ room: 'lobby', text: 'hello' }); // strings → text frames, else JSON
chat.close(); // deliberate — never reconnects
```

Semantics (AD-22 D3): `status` is a signal
(`connecting/open/reconnecting/closed`); `messages` is an async iterable
that **survives reconnects** and completes only on a deliberate `close()`
(or on any close when `reconnect: null` disables retries);
unexpected drops back off exponentially (base 1s, cap 30s, ±20% jitter
clamped to the cap, attempt counter reset on each successful open);
messages sent while disconnected are queued (opt-in, overflow drops
oldest) or dropped.

`createOnlineReconnectTrigger()` (`blue-platform-web`, browser-only) wires
window `online`/`offline` events into the client's immediate-retry path —
the browser half of the story; `@blue/socket` itself has no window globals.

Client-side metrics: `WebSocketClientInstrumentation`
(`@blue/telemetry-web`) counts outbound messages/bytes and deliberate
closes automatically (`blue.socket.client.*`); status and **reconnect**
counters wire through `countSocketClientStatus()` as the client's
`onStatusChange` option:

```ts
import { countSocketClientStatus } from '@blue/telemetry-web';

const chat = new WebSocketClient(url, { onStatusChange: countSocketClientStatus() });
```

## 7. STOMP (AD-23)

The same sessions speak the industry-standard STOMP 1.2 broker protocol:
destinations, subscriptions, receipts — interop with Spring
(`SimpMessagingTemplate`), RabbitMQ/Artemis STOMP, and @stomp/stompjs
clients. It is a protocol layer over the socket contracts, so it is
isomorphic (`@blue/socket`) and transport-agnostic:

```ts
// server: a broker owns the destination namespace; the handler runs the
// protocol for each connection
const broker = new StompBroker();   // app-scoped bean

@stompMapping('/chat')
@parameters({ session: socketSession('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);   // CONNECT/SUBSCRIBE/SEND/ACK/RECEIPT
}

// any service: scheduler → destination (SimpMessagingTemplate parity)
@scheduled('*/2 * * * * *')
tick() {
    broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
}
```

```ts
// client: STOMP over the isomorphic WebSocketClient
const stomp = new StompClient(new WebSocketClient('ws://host/stomp/chat'));
const sub = stomp.subscribe('/topic/chat');
for await (const message of sub.messages) {
    applyMessage(message.json());
}
await stomp.send('/topic/chat', { text: 'hello' }); // resolves on RECEIPT
```

Semantics: destinations are broker state, not registry rooms (MESSAGE
frames carry the subscriber's own `subscription` id — two subscriptions to
one destination on a session stay distinct); SEND fans out to subscribers
including the sender when subscribed; receipts answer every frame that
asks; heart-beat is negotiated off (`0,0`) because the registry ping/pong
already owns liveness. The second wave rounds out the protocol (AD-23
D7–D11):

- **Transactions** — BEGIN/COMMIT/ABORT with per-session buffers: SEND/
  ACK/NACK frames inside a transaction apply atomically on COMMIT, receipts
  are held until then, ABORT discards. A frame on an unknown transaction
  fails closed.
- **Ack tracking + NACK redelivery** — ack modes `client` /
  `client-individual` track delivered-but-unacked messages per subscription
  (bounded by `maxUnacked`, default 1000, FIFO eviction). `client` ACKs are
  cumulative; NACK redelivers the message with `redelivered: true`.
- **Binary bodies (D8)** — the codec and transports are byte-exact:
  `Uint8Array`/`ArrayBuffer` bodies flow as binary frames (headers always
  text); `content-length` is emitted for binary bodies. Text frames stay
  strings (`SocketSession`/`SocketClient` JSDoc updated).
- **`/user` destinations (D10)** — principal-scoped routing: subscribe
  `/user/queue/events`, then `broker.sendToUser('alice', '/queue/events',
…)` delivers to that user's scope (Spring `convertAndSendToUser` parity).
  `resolveUser(session)` (default: `session.attributes.user`) binds the
  scope; a client SEND to `/user/*` reaches only the sender's own scope,
  and sessions with no resolved user cannot bind `/user/*` (1008).
- **`/queue` destinations (D11)** — bounded store-and-forward: every SEND/
  publish appends to the destination's backlog (`queueBacklog`, default
  1000, FIFO eviction), and a new subscriber replays the backlog before
  live traffic. `queueBacklog: 0` reduces the destination to live fan-out.

Still deferred, documented: durable persistence behind `/queue` (needs the
audit's store contract — post-1.0), cross-node pub/sub, message history
beyond the bounded backlog. `@stompMapping` paths negotiate the
`v12.stomp`/`v11.stomp`/`v10.stomp` WebSocket subprotocol on upgrade;
other socket paths keep the stock behavior. **STOMP over TCP is never** —
no consumer base (browsers, STOMP.js, and Spring all use WebSocket), and
like SockJS it is a non-feature, not a gap.

## 8. Design boundaries (AD-21)

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
  message history, NACK redelivery (needs persistence) — **STOMP: built**
  (AD-23, §7); **SockJS: never** (pre-2015 fallback-transport workaround;
  third-party territory, AD-22 D4).

## 9. References

- Decision: [AD-21 — WebSocket Session Registry](../decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md),
  [AD-22 — WebSocket Client & `@blue/socket`](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md),
  [AD-23 — STOMP Protocol Layer](../decisions/2026-09-16_AD23_STOMP.md)
- Plans: [WebSocket Broadcast](../plans/2026-09-15_WEBSOCKET_BROADCAST.md),
  [WebSocket Client](../plans/2026-09-15_WEBSOCKET_CLIENT.md),
  [STOMP](../plans/2026-09-16_STOMP.md)
- Demo: `ChatController` in `apps/blue-api/src/chat-controller.ts`, e2e in
  `apps/blue-api/test/chat.spec.ts` (driven by `WebSocketClient`);
  `StompChatController` in `apps/blue-api/src/stomp-chat-controller.ts`,
  e2e in `apps/blue-api/test/stomp.spec.ts` (driven by `StompClient`)
- Package surfaces: [`@blue/socket`](../../packages/blue-socket/README.md)
  (contracts + client + STOMP), `@blue/dispatcher` (handler vocabulary),
  [`@blue/platform-node`](../../packages/blue-platform-node/README.md)
  (registry, adapter, auto-configuration), `@blue/platform-web` (online trigger)
