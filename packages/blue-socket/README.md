# @blue/socket

> Isomorphic WebSocket domain for BlueJS — session contracts and a WHATWG `WebSocket`-based client running in browsers and Node ≥22.

The isomorphic WebSocket domain package: the session contracts (still exported by `@blue/dispatcher` for `@socketMapping` handler signatures) and the client story, running on the WHATWG `WebSocket` global in browsers **and** Node ≥22 — no platform packages, no window globals. It also hosts the STOMP 1.2 protocol layer.

## Installation

```bash
pnpm add @blue/socket
```

Prerequisites for every BlueJS package: Node.js ≥22 and pnpm ≥11.

## Client

```ts
import { WebSocketClient } from '@blue/socket';
import { effect } from '@blue/signals';

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

- `status` — `@blue/signals` signal: `connecting | open | reconnecting | closed`.
- `messages` — async iterable; survives reconnects; completes only on a deliberate `close()`; bounded by `maxInboundMessages` when set (overflow drops the newest frame).
- Reconnect — exponential backoff with jitter on unexpected close only (jitter never exceeds `maxMs`); attempt counter resets on each successful open.
- Browser online/offline immediate retry: pair with `createOnlineReconnectTrigger()` from `@blue/platform-web`:

```ts
import { createOnlineReconnectTrigger } from '@blue/platform-web';

const trigger = createOnlineReconnectTrigger();
const chat = new WebSocketClient(url, { reconnectTrigger: trigger });
// …teardown: chat.close() unsubscribes; trigger.dispose() releases it entirely
```

- Status observability — the telemetry seam: pass `onStatusChange: countSocketClientStatus()` (from `@blue/telemetry-web`) to count `connecting/open/reconnecting/closed` transitions, or any observer of your own (a throwing observer cannot wedge the client).

## STOMP

The same package hosts the protocol layer: the frame codec plus the two sides of the wire.

**Server** — `StompBroker` runs the STOMP 1.2 endpoint protocol over any `SocketSession` (CONNECT negotiation, SUBSCRIBE/UNSUBSCRIBE, SEND, ACK/NACK, receipts, ERROR + close) and owns the destination namespace:

```ts
import { StompBroker } from '@blue/socket';

const broker = new StompBroker();

@stompMapping('/chat')
@parameters({ session: socketSessionValue('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);
}

@scheduled('*/2 * * * * *')
tick() {
    broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
}
```

**Client** — `StompClient` rides any `SocketClient` (the `WebSocketClient` above): CONNECT, per-destination subscriptions as async iterables, receipt-resolved sends, ack modes, and automatic re-CONNECT + re-SUBSCRIBE across socket reconnects:

```ts
import { StompClient, WebSocketClient } from '@blue/socket';

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
broker.publish('/queue/jobs', 'work'); // backlog; late subscribers replay it
broker.publish('/topic/bin', new Uint8Array([0, 1, 255])); // binary MESSAGE
```

Semantics include transactions (BEGIN/COMMIT/ABORT, per-session buffers), ack tracking + NACK redelivery (`redelivered: true`), and `/user` scoped routing. Durable persistence behind `/queue` and STOMP-over-TCP are not built in — see the [websockets guide](../../docs/guides/06-websockets.md) for the full semantics.

## API

The full API is generated from JSDoc via `pnpm doc:api` into
[`doc/api/`](doc/api/index.md). Primary exports live in
[`src/index.ts`](src/index.ts); see the [package index](../../doc-md/README.md) for
how it fits with the rest of BlueJS.

- **Client** — `WebSocketClient`, `StompClient`
- **Server** — `StompBroker`
- **Contracts** — `SocketSession`, `SocketRequestSources`, `SocketSessionRegistry` (type-only; re-exported by `@blue/dispatcher`)

## Development

```bash
pnpm --filter @blue/socket build:lib
pnpm --filter @blue/socket test
```

## See Also

- [@blue/signals](../blue-signals/README.md) — reactive state the client wraps in signals
- [@blue/platform-node](../blue-platform-node/README.md) — the `SocketSessionRegistry` server side
- [@blue/dispatcher](../blue-dispatcher/README.md) — re-exports the socket session contracts

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md).

## License

[ISC](../../LICENSE)
