# Guide 15 — WebSockets

How realtime endpoints work in Ndigo: `@socketMapping`, the
`SocketSession` contract, the session registry (rooms + broadcast), and the
heartbeat. WebSockets are served from the same dispatcher as HTTP routes —
same radix mapping, same `@parameters` binding, same Zod validation — with
a **connection** contract instead of a request/response pair.

The design: per-kind sessions with no generic base class. The dispatcher
owns the types handlers sign against; the Node platform implements the
machinery; the application context composes it — a Node app can run socket
sessions and HTTP sessions side by side as separate beans bound through
separate extractors (`socketSessionValue()` / `requestSessionValue()`).

**Audience:** Node and browser application developers · **Prerequisites:** Guide 01 · **Reference app:** `apps/05-ndigo-api`, `apps/13-ndigo-chat`

## What you'll learn

- Declare handlers with `@socketMapping`.
- Use the session registry for rooms and broadcast.
- Add heartbeat and origin checks.
- Connect with the isomorphic client.
- Continue with [guide 42](42-stomp.md) for STOMP and cross-node fan-out.

## 1. Quickstart

Add a `@socketMapping` handler to any controller and connect:

```ts
import { parameters, socketMapping, socketSessionValue, type SocketSession } from '@ndigo/dispatcher';

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
(`SocketSessionRegistry` contract in `@ndigo/dispatcher`, implementation in
`@ndigo/platform-node`). The HTTP server resolves it at start, so the bean
**is the adapter's registry** — any service can push to live sessions:

```ts
import { type SocketSessionRegistry } from '@ndigo/dispatcher';

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
`1013` ("try again later", the `SESSION_NOT_RELIABLE` convention) —
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
NDIGO_SOCKET_MAX_PAYLOAD_BYTES=1048576       # frame payload cap (default 1 MiB)
NDIGO_SOCKET_MAX_QUEUED_MESSAGES=1024        # inbound queue cap per session (default 1024)
NDIGO_SOCKET_MAX_QUEUED_BYTES=4194304        # inbound byte budget (default 4 MiB; 0 disables)
NDIGO_SOCKET_MAX_BUFFERED_BYTES=1048576      # outbound watermark (default 1 MiB; 0 disables)
NDIGO_SOCKET_ON_OVERFLOW=close               # close (default, 1013) | drop
```

Socket observability ships as `WebSocketServerInstrumentation`
(`@ndigo/telemetry-node`, opt-in like the HTTP instrumentation): session
lifetime spans (`SocketSession.connect`, path/duration/close code),
sessions opened/closed, fan-out messages/bytes (per path; per room only
with the `roomAttribute` option — room names are arbitrary application
strings, so attributing them by default would mint unbounded metric
series), and backpressure counters (`close` and `drop` actions) — all
under `ndigo.socket.*`.

Also on the session: `session.attributes` — a per-connection state bag
(Micronaut/Jakarta parity), and `session.close(code, reason)` for a
server-initiated close. The adapter's optional `authenticate(sources)`
hook runs before the handler: return an object to populate
`session.attributes` (the identity binding — e.g. `{ principal }`), or
`null` to reject the upgrade with `1008`.

## 3. Scheduler → room (cross-context push)

The registry is ordinary DI, so scheduled tasks or HTTP handlers can push
into rooms — the `apps/05-ndigo-api` demo proves it with a chat room where a
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
NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS=10000   # ping every 10s
NDIGO_SOCKET_IDLE_TIMEOUT_MS=30000         # reap after 30s silent
NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS=0       # disable explicitly (not recommended)
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
from `NDIGO_SOCKET_ALLOWED_ORIGINS` (comma-separated bare origins,
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
        return principal ? { principal, user: principal.id } : null; // null ⇒ close 1008
    },
});

// or as a context bean (bean-based apps never construct the server):
class SocketAuthConfiguration {
    @entry
    socketRequestAuthenticator(): SocketRequestAuthenticator {
        return {
            authenticate: (sources) => {
                const principal = lookupPrincipal(tokenFrom(sources));
                return principal ? { principal, user: principal.id } : null;
            },
        };
    }
}
```

`HTTPServer` resolves a `socketRequestAuthenticator` bean when no explicit
option is passed (the same pattern as `socketSessionRegistry`). The
attribute bag is merged into `session.attributes`, so `{ user }` also
drives STOMP `/user/*` routing (`resolveUser`). `authenticateTimeoutMs`
(default 10 s) closes a socket whose authenticator never settles, and
`maxConnections` bounds concurrent accepted upgrades (`1013` over the cap).
`apps/05-ndigo-api` wires the reference implementation (demo token in
`?token=` or `Authorization: Bearer …`) and marks its STOMP endpoint
`@authenticated`; its raw `/ws/chat` endpoint stays open as the documented
public-socket contrast.

## 6. The client (`@ndigo/socket`)

`WebSocketClient` is the isomorphic client: WHATWG `WebSocket` global in
browsers **and** Node ≥24, with signal-based status and reconnect:

```ts
import { WebSocketClient } from '@ndigo/socket';
import { effect } from '@ndigo/signals';

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

`createOnlineReconnectTrigger()` (`ndigo-platform-web`, browser-only) wires
window `online`/`offline` events into the client's immediate-retry path —
the browser half of the story; `@ndigo/socket` itself has no window globals.

Client-side metrics: `WebSocketClientInstrumentation`
(`@ndigo/telemetry-web`) counts outbound messages/bytes and deliberate
closes automatically (`ndigo.socket.client.*`); status and **reconnect**
counters wire through `countSocketClientStatus()` as the client's
`onStatusChange` option:

```ts
import { countSocketClientStatus } from '@ndigo/telemetry-web';

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
Env override: `NDIGO_SOCKET_MAX_PAYLOAD_BYTES`,
`NDIGO_SOCKET_MAX_QUEUED_MESSAGES`, `NDIGO_SOCKET_MAX_QUEUED_BYTES`,
`NDIGO_SOCKET_MAX_BUFFERED_BYTES` (`0` disables the byte budgets) and
`NDIGO_SOCKET_ON_OVERFLOW` (`close`|`drop`).

Client-side, `WebSocketClient.send` drops non-serializable payloads
(`undefined`, functions, symbols) instead of queueing a frame that would
wedge the reconnect flush; a partial `reconnect` policy falls back to the
documented defaults per field instead of producing NaN retry delays; and
`maxInboundMessages` (opt-in) caps the inbound queue. `StompClient`
buffers sends while disconnected under `maxPendingSends` (default 10 000,
drop-oldest) and bounds each subscription's MESSAGE queue under
`maxSubscriptionMessages` (default 4096, drop-newest) — a stalled
consumer cannot pin memory on any path.

## 7. STOMP and cross-node fan-out

STOMP is a protocol layer over the socket contracts — destinations,
subscriptions, transactions, receipts, `/user` and `/queue` semantics — and the
Redis fan-out spans nodes. [Guide 42](42-stomp.md) covers that surface, the
resource caps, and the ordered shutdown; the client section above is the
transport.

## 8. Design boundaries

- **No generic `Session` base class.** HTTP session state and WebSocket
  connections share only "ID + data container" — every operation past that
  splits by lifecycle. Research appendix in the plan
  (`docs/plans/2026-09-15_WEBSOCKET_BROADCAST.md`): no framework unifies
  them, including Micronaut (whose `WebSocketSession` shares an
  attribute-bag mixin, not a base).
- **Names are adjectival**: `AuthSession` (auth state), `SocketSession`
  (connection), `HttpSession` (reserved for the future session store).
- **Client story**: `@ndigo/socket` — the isomorphic client package
  (`SocketClient`, reconnect + status signal) — see
  [WebSocket client](../decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md) and
  [plan](../plans/2026-09-15_WEBSOCKET_CLIENT.md).
- **Cross-node live fan-out: opt-in**, through `SocketFanout` and
  `@ndigo/redis/pubsub`; socket ownership, room membership, queue consumption
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
- Demo: `ChatController` in `apps/05-ndigo-api/src/chat-controller.ts`, e2e in
  `apps/05-ndigo-api/test/chat.spec.ts` (driven by `WebSocketClient`);
  `StompChatController` in `apps/05-ndigo-api/src/stomp-chat-controller.ts`,
  e2e in `apps/05-ndigo-api/test/stomp.spec.ts` (driven by `StompClient`)
- Package surfaces: [`@ndigo/socket`](../../packages/ndigo-socket/README.md)
  (contracts + client + STOMP), `@ndigo/dispatcher` (handler vocabulary),
  [`@ndigo/platform-node`](../../packages/ndigo-platform-node/README.md)
  (registry, adapter, auto-configuration), `@ndigo/platform-web` (online trigger)

## See also

- [Guide 42 — STOMP & Cross-Node Fan-Out](42-stomp.md) — the protocol layer and Redis fan-out
- [Guide 29 — Signals & Islands](29-signals-and-islands.md) — SSE into reactive state
- [Guide 26 — Authentication & Sessions](26-authentication-and-sessions.md) — socket auth
- [Guide 28 — Security Hardening](28-security-hardening.md) — origins and rate limits
- [`@ndigo/socket`](../../packages/ndigo-socket/README.md) — client, sessions, and STOMP
