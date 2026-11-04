# @ndigo/socket

> Isomorphic WebSocket domain for Ndigo — session contracts and a WHATWG `WebSocket`-based client running in browsers and Node ≥24.

The isomorphic WebSocket domain package: the session contracts (still exported by `@ndigo/dispatcher` for `@socketMapping` handler signatures) and the client story, running on the WHATWG `WebSocket` global in browsers **and** Node ≥24 — no platform packages, no window globals. It also hosts the STOMP 1.2 protocol layer.

## Installation

```bash
pnpm add @ndigo/socket
```

Prerequisites for every Ndigo package: Node.js ≥24 and pnpm ≥11.

## Getting Started

```ts
import { WebSocketClient } from '@ndigo/socket';

const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
    reconnect: { baseMs: 1000, maxMs: 30_000, jitter: 0.2 },
});

chat.send({ room: 'lobby', text: 'hello' });

for await (const message of chat.messages) {
    applyMessage(JSON.parse(String(message)));
}

chat.close(); // deliberate — never reconnects
```

## Usage

### Client

```ts
import { WebSocketClient } from '@ndigo/socket';
import { effect } from '@ndigo/signals';

const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
    reconnect: { baseMs: 1000, maxMs: 30_000, jitter: 0.2 }, // default policy
    bufferWhileDisconnected: { maxMessages: 100 }, // opt-in queue
    maxInboundMessages: 1024, // opt-in inbound watermark
});

effect(() => {
    if (chat.status.value === 'open') {
        statusDot.hidden = false;
    }
});

for await (const message of chat.messages) {
    applyMessage(JSON.parse(String(message)));
}
chat.send({ room: 'lobby', text: 'hello' });
chat.close(); // deliberate — never reconnects
```

- `status` — `@ndigo/signals` signal: `connecting | open | reconnecting | closed`.
- `messages` — async iterable; survives reconnects; completes only on a deliberate `close()`; bounded by `maxInboundMessages` when set (overflow drops the newest frame).
- Reconnect — exponential backoff with jitter on unexpected close only (jitter never exceeds `maxMs`); attempt counter resets on each successful open.
- Browser online/offline immediate retry: pair with `createOnlineReconnectTrigger()` from `@ndigo/platform-web`:

```ts
import { createOnlineReconnectTrigger } from '@ndigo/platform-web';

const trigger = createOnlineReconnectTrigger();
const chat = new WebSocketClient(url, { reconnectTrigger: trigger });
// …teardown: chat.close() unsubscribes; trigger.dispose() releases it entirely
```

- Status observability — the telemetry seam: pass `onStatusChange: countSocketClientStatus()` (from `@ndigo/telemetry-web`) to count `connecting/open/reconnecting/closed` transitions, or any observer of your own (a throwing observer cannot wedge the client).

### STOMP

The same package hosts the protocol layer: the frame codec plus the two sides of the wire.

**Server** — `StompBroker` runs the STOMP 1.2 endpoint protocol over any `SocketSession` (CONNECT negotiation, SUBSCRIBE/UNSUBSCRIBE, SEND, ACK/NACK, receipts, ERROR + close) and owns the destination namespace:

```ts
import { StompBroker } from '@ndigo/socket';

const broker = new StompBroker();

@stompMapping('/chat')
@parameters({ session: socketSessionValue('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);
}

@scheduled('*/2 * * * * *')
async tick() {
    await broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
}
```

**Client** — `StompClient` rides any `SocketClient` (the `WebSocketClient` above): CONNECT, per-destination subscriptions as async iterables, receipt-resolved sends, ack modes, and automatic re-CONNECT + re-SUBSCRIBE across socket reconnects:

```ts
import { StompClient, WebSocketClient } from '@ndigo/socket';

const stomp = new StompClient(new WebSocketClient('ws://host/stomp/chat'));
const chat = stomp.subscribe('/topic/chat');
for await (const message of chat.messages) {
    applyMessage(message.json());
}
await stomp.send('/topic/chat', { text: 'hello' }); // resolves on RECEIPT
stomp.disconnect(); // DISCONNECT + close — never reconnects
```

Server-side routing beyond topics covers `/user` scoped routing (`broker.sendToUser(user, destination, …)`), `/queue` bounded store-and-forward with backlog replay, and byte-exact binary MESSAGE bodies:

```ts
const broker = new StompBroker({
    resolveUser: (session) => session.attributes.user, // maps the session to /user routing
});
broker.sendToUser('alice', '/queue/events', JSON.stringify({ kind: 'alert' })); // /user scope
await broker.publish('/queue/jobs', 'work'); // backlog; late subscribers replay it
await broker.publish('/topic/bin', new Uint8Array([0, 1, 255])); // binary MESSAGE
```

Semantics include transactions (BEGIN/COMMIT/ABORT, per-session buffers), ack tracking + NACK redelivery (`redelivered: true`), and `/user` scoped routing. Durable `/queue` storage is available through `LibSQLQueueMessageStore` from `@ndigo/orm-drizzle`; it is separate from cross-node live delivery. STOMP-over-TCP and SockJS are deliberately not provided — see the [websockets guide](../../docs/guides/06-websockets.md) for the full semantics.

### Cross-node live delivery

`SocketFanout` is the optional application-owned transport contract:

```ts
interface SocketFanout {
    subscribe(
        scope: 'path' | 'room' | 'topic',
        receive: (message: SocketFanoutMessage) => void
    ): Promise<() => Promise<void>>;
    publish(scope: 'path' | 'room' | 'topic', message: SocketFanoutMessage): Promise<void>;
}
// SocketFanoutMessage: { key: string; body: string | Uint8Array; headers?: Record<string, string> }
```

`StompBroker({ fanout })` crosses **only `/topic/*`**, including inbound SEND.
Await the transport's explicit connection, then `broker.connect()` before
serving; await `broker.publish()` to observe publish failure. It returns
`Promise<StoredQueueMessage | undefined>` (stored queue record when applicable),
not a client-delivery acknowledgement. Without fanout, the local default remains.
`/queue/*`, `/user/*`, transactions, MESSAGE/ACK IDs and queue replay remain
broker-local; `QueueMessageStore` is a separate persistence seam, not a
distributed consumer queue.

The contract excludes the publishing transport's subscribers; consumers deliver
locally once after backend acceptance. Failed topic publication rejects before
local delivery; inbound SEND sends ERROR then closes `1011`, never a silent
local-only fallback. Delivery/reconnect/limits belong to the adapter: the
Node-only `RedisSocketFanout` in `@ndigo/redis/pubsub` is live at-most-once with
no reconnect, replay, global ordering or exactly-once promise. Each transport
supports one consumer per scope; a registry (`path`/`room`) and broker (`topic`)
can share one. Await `broker.close()` to close sessions and unsubscribe before
the owner closes the transport/publisher; it does not close either transport or
queue store. See the [opt-in composition and limits](../../docs/guides/06-websockets.md#cross-node-live-fan-out-opt-in).

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`api/`](api/README.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../API.md) for
how it fits with the rest of Ndigo.

- **Client** — `WebSocketClient`, `StompClient`
- **Server** — `StompBroker`
- **Contracts** — `SocketSession`, `SocketRequestSources`, `SocketSessionRegistry` (type-only; re-exported by `@ndigo/dispatcher`), `SocketFanout`, `SocketFanoutScope`, `SocketFanoutMessage`

## Development

```bash
pnpm --filter @ndigo/socket build:lib
pnpm --filter @ndigo/socket test
```

## See Also

- [@ndigo/signals](../ndigo-signals/README.md) — reactive state the client wraps in signals
- [@ndigo/platform-node](../ndigo-platform-node/README.md) — the `SocketSessionRegistry` server side
- [@ndigo/dispatcher](../ndigo-dispatcher/README.md) — re-exports the socket session contracts

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
