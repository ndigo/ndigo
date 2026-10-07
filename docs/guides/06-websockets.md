# Guide 06 — WebSockets, Rooms, Broadcast, and STOMP

How realtime endpoints work in BlueJS: `@socketMapping`, the
`SocketSession` contract, the session registry (rooms + broadcast), and the
heartbeat. WebSockets are served from the same dispatcher as HTTP routes —
same radix mapping, same `@parameters` binding, same Zod validation — with
a **connection** contract instead of a request/response pair.

The design: per-kind sessions with no generic base class. The dispatcher
owns the types handlers sign against; the Node platform implements the
machinery; the application context composes it — a Node app can run socket
sessions and HTTP sessions side by side as separate beans bound through
separate extractors (`socketSessionValue()` / `requestSessionValue()`).

## 1. Quickstart

Add a `@socketMapping` handler to any controller and connect:

```ts
import { parameters, socketMapping, socketSessionValue, type SocketSession } from '@blue/dispatcher';

@requestMapping('/ws')
class ChatController {
    @socketMapping('/echo')
    @parameters({ session: socketSessionValue('session') })
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
@parameters({ session: socketSessionValue('session'), token: queryValue('token') })
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
await registry.broadcast('/ws/room', { event: 'server', data: 'maintenance window' });
registry.count('/ws/room'); // 0 if nobody is connected
registry.closeAll(1001, 'bye'); // graceful server shutdown
```

Every session auto-joins a set keyed by its endpoint path, so
`broadcast(path, …)` is zero-setup. Named rooms are the finer grouping:
`session.join('room')` / `session.leave('room')` in the handler, and
`broadcastTo('room', …)` from anywhere. Both return `Promise<void>` and must
be awaited. Local delivery is best-effort — closed sessions are skipped,
transport errors tolerated — but configured cross-node publish failures reject
before local delivery; they never silently fall back to local-only mode. Backpressure is on by
default: a session whose transport buffer exceeds 1 MiB is closed with
`1013` ("try again later", Spring's `SESSION_NOT_RELIABLE`) —
client reconnects and resyncs. Tune per registry:
`{ backpressure: { maxBufferedBytes, onOverflow: 'drop' | 'close' } }`
(`drop` skips silently; `null` disables the guard). The decision is
memoized per session — a close handshake in flight never re-fires the
decision on later broadcasts — and every decision (close and drop) is
observable via the registry's `onOverflow` observer
(`addOverflowObserver(event)` for post-construction wiring, e.g.
telemetry).

Inbound is bounded too: the adapter sets `ws` `maxPayload` (frame size,
default 1 MiB — `ws` closes `1009` on oversized frames) and each session's
inbound queue caps at `maxQueuedMessages` (default 1024) **and** a
cumulative `maxQueuedBytes` budget (default 4 MiB), closing `1013` on
overflow — the inbound mirror of the outbound watermark (the byte budget
is what stops a stalled handler pinning `count × payload`). Tune per
adapter or by env:

```
BLUE_SOCKET_MAX_PAYLOAD_BYTES=1048576       # frame payload cap (default 1 MiB)
BLUE_SOCKET_MAX_QUEUED_MESSAGES=1024        # inbound queue cap per session (default 1024)
BLUE_SOCKET_MAX_QUEUED_BYTES=4194304        # inbound byte budget (default 4 MiB; 0 disables)
BLUE_SOCKET_MAX_BUFFERED_BYTES=1048576      # outbound watermark (default 1 MiB; 0 disables)
BLUE_SOCKET_ON_OVERFLOW=close               # close (default, 1013) | drop
```

Socket observability ships as `WebSocketServerInstrumentation`
(`@blue/telemetry-node`, opt-in like the HTTP instrumentation): session
lifetime spans (`SocketSession.connect`, path/duration/close code),
sessions opened/closed, fan-out messages/bytes (per path; per room only
with the `roomAttribute` option — room names are arbitrary application
strings, so attributing them by default would mint unbounded metric
series), and backpressure counters (`close` and `drop` actions) — all
under `blue.socket.*`.

Also on the session: `session.attributes` — a per-connection state bag
(Micronaut/Spring/Jakarta parity), and `session.close(code, reason)` for a
server-initiated close. The adapter's optional `authenticate(sources)`
hook runs before the handler: return an object to populate
`session.attributes` (the identity binding — e.g. `{ principal }`), or
`null` to reject the upgrade with `1008`.

## 3. Scheduler → room (cross-context push)

The registry is ordinary DI, so scheduled tasks or HTTP handlers can push
into rooms — the `apps/04-blue-api` demo proves it with a chat room where a
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
    @parameters({ session: socketSessionValue('session') })
    async chat(session: SocketSession) {
        session.join('room');
        for await (const message of session.messages) {
            await this.#registry()?.broadcastTo('room', { event: 'chat', data: String(message) });
        }
    }

    @scheduled('*/2 * * * * *')
    async chatTick() {
        await this.#registry()?.broadcastTo('room', { event: 'chat-tick', at: Date.now() });
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

### Authentication and authorization (socket dispatch)

Socket handlers never run the HTTP interceptor chain, so `@authenticated` /
`@authorized` are enforced **at dispatch** instead: before a
`@socketMapping`/`@stompMapping` handler is invoked, the adapter reads the
route auth metadata (class and method level) and fails closed with close
`1008` when authentication is required and the session carries no principal,
or when a required role is missing. A handler with no auth metadata is
unaffected.

The principal must be on the session's attribute bag
(`session.attributes.principal` — any object with `hasRole(role)`); the
upgrade-time authenticator is what puts it there:

```ts
// direct wiring
new HTTPServer(dispatcher, {
    authenticate: (sources) => {
        const principal = lookupPrincipal(sources.query.token as string);
        return principal ? { principal, user: principal.id } : null;   // null ⇒ close 1008
    },
});

// or as a context bean (bean-based apps never construct the server):
@entry socketRequestAuthenticator(): SocketRequestAuthenticator {
    return {
        authenticate: (sources) => {
            const principal = lookupPrincipal(tokenFrom(sources));
            return principal ? { principal, user: principal.id } : null;
        },
    };
}
```

`HTTPServer` resolves a `socketRequestAuthenticator` bean when no explicit
option is passed (the same pattern as `socketSessionRegistry`). The
attribute bag is merged into `session.attributes`, so `{ user }` also
drives STOMP `/user/*` routing (`resolveUser`). `authenticateTimeoutMs`
(default 10 s) closes a socket whose authenticator never settles, and
`maxConnections` bounds concurrent accepted upgrades (`1013` over the cap).
`apps/04-blue-api` wires the reference implementation (demo token in
`?token=` or `Authorization: Bearer …`) and marks its STOMP endpoint
`@authenticated`; its raw `/ws/chat` endpoint stays open as the documented
public-socket contrast.

## 6. The client (`@blue/socket`)

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

Semantics: `status` is a signal
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

### Transport bounds (slow-consumer and flood guards)

Every **outbound** path — registry broadcast, direct `session.send`,
handler pumps, STOMP fan-out — shares one watermark at the transport
(`maxBufferedBytes`, default 1 MiB): a peer whose `bufferedAmount` is over
the watermark is handled per `onOverflow` — `close` (default) closes it
with `1013` ("try again later"; client reconnects with backoff)
or `drop` silently skips the frame. The memory cost of a room is set by
its slowest member, on all paths, not just registry fan-out.

**Inbound** is bounded twice: per-frame (`maxPayloadBytes`, 1 MiB — ws
closes `1009` on oversized frames) and per-session queue —
`maxQueuedMessages` (1024) **and** a cumulative byte budget
(`maxQueuedBytes`, 4 MiB) so a stalled handler cannot pin
`count × payload` (~1 GiB at the defaults). Queue overflow closes `1013`.
Env override: `BLUE_SOCKET_MAX_PAYLOAD_BYTES`,
`BLUE_SOCKET_MAX_QUEUED_MESSAGES`, `BLUE_SOCKET_MAX_QUEUED_BYTES`,
`BLUE_SOCKET_MAX_BUFFERED_BYTES` (`0` disables the byte budgets) and
`BLUE_SOCKET_ON_OVERFLOW` (`close`|`drop`).

Client-side, `WebSocketClient.send` drops non-serializable payloads
(`undefined`, functions, symbols) instead of queueing a frame that would
wedge the reconnect flush; a partial `reconnect` policy falls back to the
documented defaults per field instead of producing NaN retry delays; and
`maxInboundMessages` (opt-in) caps the inbound queue. `StompClient`
buffers sends while disconnected under `maxPendingSends` (default 10 000,
drop-oldest) and bounds each subscription's MESSAGE queue under
`maxSubscriptionMessages` (default 4096, drop-newest) — a stalled
consumer cannot pin memory on any path.

## 7. STOMP

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
@parameters({ session: socketSessionValue('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);   // CONNECT/SUBSCRIBE/SEND/ACK/RECEIPT
}

// any service: scheduler → destination (SimpMessagingTemplate parity)
@scheduled('*/2 * * * * *')
async tick() {
    await broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
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
already owns liveness. The second wave rounds out the protocol:

- **Transactions** — BEGIN/COMMIT/ABORT with per-session buffers: SEND/
  ACK/NACK frames inside a transaction apply atomically on COMMIT, receipts
  are held until then, ABORT discards. A frame on an unknown transaction
  fails closed.
- **Ack tracking + NACK redelivery** — ack modes `client` /
  `client-individual` track delivered-but-unacked messages per subscription.
  `client` ACKs are cumulative (everything up to the named message);
  `client-individual` ACKs exactly the named message — earlier unacked
  deliveries stay tracked and NACK-able. NACK redelivers the named message
  with `redelivered: true`. MESSAGE frames for these modes carry an `ack`
  header, so a spec-conforming client can ack with `id` alone (the
  `subscription` header is accepted too). Tracking is bounded by count
  (`maxUnacked`, default 1000), by bytes per subscription (`maxUnackedBytes`,
  default 1 MiB) and by bytes per session (`maxUnackedSessionBytes`, default
  16 MiB) — oldest-first eviction on every bound, so a slow acker cannot pin
  memory.
- **Binary bodies** — the codec and transports are byte-exact:
  `Uint8Array`/`ArrayBuffer` bodies flow as binary frames (headers always
  text); `content-length` is emitted for binary bodies. Text frames stay
  strings (`SocketSession`/`SocketClient` JSDoc updated).
- **`/user` destinations** — principal-scoped routing: subscribe
  `/user/queue/events`, then `broker.sendToUser('alice', '/queue/events',
…)` delivers to that user's scope (Spring `convertAndSendToUser` parity).
  `resolveUser(session)` (default: `session.attributes.user`) binds the
  scope; a client SEND to `/user/*` reaches only the sender's own scope,
  and sessions with no resolved user cannot bind `/user/*` (1008).
- **`/queue` destinations** — bounded store-and-forward: every SEND/
  publish appends to the destination's backlog (`queueBacklog`, default
  1000, FIFO eviction), and a new subscriber replays the backlog before
  live traffic. `queueBacklog: 0` reduces the destination to live fan-out.
  Retention is further bounded globally: the number of distinct `/queue`
  destinations is capped (`maxBacklogDestinations`, default 1000 — the
  oldest destination is evicted whole, releasing its retained messages, its
  byte accounting **and its sequence entry**) and the retained bytes across
  all destinations are capped (`maxBacklogBytes`, default 64 MiB — oldest
  messages evicted first). Retained destination _keys_ are bounded by the
  same cap, so a client cannot grow the server's memory by SENDing to
  arbitrary `/queue/<name>` destinations; how much history one connection
  may pull back is bounded separately by `maxReplayBytesPerSession`
  (default 16 MiB, consumed by subscribe replays — exhaustion fails closed).
- **Durable-queue seam (store-read phase)** — the store is the single
  source of truth for `/queue`: every append persists through it and
  subscribe replay reads from it. The default is an
  `InMemoryQueueMessageStore` built from the backlog caps above;
  `LibSQLQueueMessageStore` from `@blue/orm-drizzle` provides durable storage
  through the broker's `queueStore` option. This is separate from live Redis
  fan-out, not a distributed queue — **a `RECEIPT` means
  "persisted"** for `/queue` destinations (the receipt follows the append; a
  store fault withholds it and fails closed with an `ERROR` frame followed
  by a `1011` close, per the STOMP rule that an ERROR is always followed by
  a close — the subscribe-replay path does the same).
- **Message history** — `broker.history('/queue/x', { limit, afterSeq })`
  reads the retained window (the same seam subscribe replay reads); the
  `retention: { ttlMs, maxMessages }` broker option bounds both durable
  retention and the subscribe-replay window (newest `N`, TTL-pruned before
  replay). Backend-agnostic: works identically on the in-memory store.
- **Resource caps** — the broker fails closed on client-driven growth:
  `maxSubscriptionsPerSession` (1000), `maxTransactionsPerSession` (8)
  with `maxTransactionOps` (1000) and `maxTransactionBytes` (16 MiB) per
  open transaction (SEND **and** ACK/NACK ops), `maxIdentifierLength`
  (1024 characters — destinations, subscription/transaction/receipt ids),
  the unacked byte bounds above, and `maxReplayBytesPerSession` (16 MiB).
  All caps fail closed per the protocol-error policy (ERROR + close on the
  violating frame). Transaction-buffered SENDs to `/user/*` ride the same
  principal-scope routing and policy check as live SENDs.
- **Policy seams** — `onMessage(destination, body, headers, session)` is the
  app-routing hook: return `false` to suppress the default fan-out (the
  frame still receipts — the app handled it). `authorize(destination,
action, session)` is the _denial_ gate, consulted on SUBSCRIBE (before any
  replay) and on SEND in both the live and transactional paths; `false`
  fails closed with ERROR + close `1008`. `verifyCredentials(login,
passcode, session)` validates CONNECT credentials — and a CONNECT that
  carries `login`/`passcode` with **no** verifier configured is rejected
  (fail closed) rather than silently trusting them.
- **Spec conformance** — the codec accepts `EOL = [CR] LF`, treats undefined
  header escapes as fatal, keeps the **first** of a repeated header, allows
  trailing EOLs after the terminating NUL, and rejects anything after them.
  A CONNECT without `accept-version` means STOMP 1.0 (negotiated as 1.0, not
  refused). User-defined SEND headers pass through to MESSAGE frames. An
  `ERROR` frame is always followed by a close (the stream is over when an
  ERROR arrives).

Still deferred: cross-node queue consumption/coordination and message history
beyond the configured retained window. Durable LibSQL `/queue` storage and
live Redis path/room/topic fan-out are implemented separately. `@stompMapping` paths negotiate the
`v12.stomp`/`v11.stomp`/`v10.stomp` WebSocket subprotocol on upgrade;
other socket paths keep the stock behavior. **STOMP over TCP is never** —
no consumer base (browsers, STOMP.js, and Spring all use WebSocket), and
like SockJS it is a non-feature, not a gap.

### Cross-node live fan-out (opt-in)

The memory/local default is unchanged. Compose external resources explicitly;
install `@blue/redis` and its `@blue/socket` capability peer. This example uses
an existing `NodeDispatcher` named `dispatcher` and an application context named
`context`; the endpoint controller must use this same `broker` for
`handleSocket(session)`, and room handlers use the server's shared registry:

```ts
import { RedisConnection } from '@blue/redis';
import { RedisSocketFanout } from '@blue/redis/pubsub';
import { StompBroker } from '@blue/socket';
import { HTTPServer, NodeSocketSessionRegistry } from '@blue/platform-node';

const url = process.env.REDIS_URL!; // explicit redis:// or rediss://
const publisher = new RedisConnection({ url });
const fanout = new RedisSocketFanout({
    connection: publisher,
    subscriberUrl: url, // adapter creates a separate owned subscriber
    namespace: 'my-app.production',
});
const registry = new NodeSocketSessionRegistry({ fanout });
const broker = new StompBroker({ fanout });
const server = new HTTPServer(dispatcher, { socketRegistry: registry });

await publisher.connect();
await fanout.connect();
await registry.connect(); // subscribes path + room
await broker.connect(); // subscribes topic
await server.start(); // serve only after subscriptions are ready

await registry.broadcast('/ws/chat', { event: 'notice' });
await registry.broadcastTo('lobby', new Uint8Array([0, 1, 255]));
await broker.publish('/topic/chat', 'hello', { kind: 'notice' });

// Stop scheduled/HTTP producers first; close all resources even if one fails.
try {
    await server.close();
} finally {
    try {
        await Promise.all([registry.close(), broker.close()]);
    } finally {
        try {
            await fanout.close();
        } finally {
            await publisher.close();
            context.close(); // synchronous: cannot await these resources for you
        }
    }
}
```

`HTTPServer`'s `socketRegistry` option passes this registry to its **default**
adapter; it does not register beans or discover the broker. Without that option,
the managed server resolves the `socketSessionRegistry` context bean. For a custom
adapter pass the registry to that adapter, not simultaneously to `HTTPServer`.
Startup failure also requires the same owner-managed cleanup before exiting.

One transport permits one consumer per scope: a registry owns `path`/`room`, a
broker owns `topic`. For additional registries/brokers on one node, compose
separate transports. Each node uses the same namespace and envelope schema.
Registry joins/counts and sockets stay local; only already-serialized text or
binary payloads cross Redis. Only STOMP `/topic/*` crosses nodes, including SEND
and transaction-applied topic SEND; `/queue/*` and `/user/*` remain local. Each
broker assigns its own MESSAGE/ACK IDs. Queue persistence/replay is independent.

Publishing resolves on Redis acceptance, **not** delivery to every client.
Random transport origins suppress the publisher's Redis echo; the consumer then
delivers locally once. Delivery is live at-most-once, with no reconnect, offline
queue, replay, global ordering or exactly-once guarantee. A closed/unready
publisher or subscriber rejects publication before local delivery; inbound
STOMP publish failure sends ERROR then closes `1011`. Replace and explicitly
connect failed resources rather than expecting retry or a local fallback.

Redis namespaces are 1–128 ASCII characters matching
`[A-Za-z0-9][A-Za-z0-9._-]*` (unlike cache namespaces, no colon). The default
`maxMessageBytes` is 1 MiB of the complete UTF-8 JSON envelope, including headers
and binary base64 overhead, not 1 MiB of raw body. Keys are 1–1024 characters;
headers have at most 128 entries, names 1–1024 characters and string values up
to 8192 characters. Malformed inbound envelopes are dropped and exposed through
`fanout.lastDecodeError` (and through `fanout.lastError` when they are the most
recent failure); invalid outbound envelopes reject before Redis I/O. Redis
access must be trusted: ACLs/network isolation (and `rediss://` remotely) protect
channels; a namespace is isolation convention, not authorization.

## 8. Design boundaries

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
  [WebSocket client](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md) and
  [plan](../plans/2026-09-15_WEBSOCKET_CLIENT.md).
- **Cross-node live fan-out: opt-in**, through `SocketFanout` and
  `@blue/redis/pubsub`; socket ownership, room membership, queue consumption
  and ACK/message IDs remain local. Durable `/queue` persistence is available
  through `LibSQLQueueMessageStore`; it is not durable pub/sub.
- **SockJS: never** (pre-2015 fallback-transport workaround; third-party
  territory). STOMP-over-TCP is also deliberately not provided.

## 9. References

- Decision: [WebSocket session registry](../decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md),
  [WebSocket client](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md),
  [STOMP protocol layer](../decisions/2026-09-16_AD23_STOMP.md)
- Plans: [WebSocket Broadcast](../plans/2026-09-15_WEBSOCKET_BROADCAST.md),
  [WebSocket Client](../plans/2026-09-15_WEBSOCKET_CLIENT.md),
  [STOMP](../plans/2026-09-16_STOMP.md)
- Demo: `ChatController` in `apps/04-blue-api/src/chat-controller.ts`, e2e in
  `apps/04-blue-api/test/chat.spec.ts` (driven by `WebSocketClient`);
  `StompChatController` in `apps/04-blue-api/src/stomp-chat-controller.ts`,
  e2e in `apps/04-blue-api/test/stomp.spec.ts` (driven by `StompClient`)
- Package surfaces: [`@blue/socket`](../../packages/blue-socket/README.md)
  (contracts + client + STOMP), `@blue/dispatcher` (handler vocabulary),
  [`@blue/platform-node`](../../packages/blue-platform-node/README.md)
  (registry, adapter, auto-configuration), `@blue/platform-web` (online trigger)
