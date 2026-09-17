# @blue/socket

The isomorphic WebSocket domain package (AD-22): the session contracts
(still exported by `@blue/dispatcher` for `@socketMapping` handler
signatures) and the client story, running on the WHATWG `WebSocket` global
in browsers **and** Node ≥22 — no platform packages, no window globals.

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
- `messages` — async iterable; survives reconnects; completes only on a
  deliberate `close()`; bounded by `maxInboundMessages` when set (overflow
  drops the newest frame).
- Reconnect — exponential backoff with jitter on unexpected close only
  (jitter never exceeds `maxMs`); attempt counter resets on each successful
  open.
- Browser online/offline immediate retry: pair with
  `createOnlineReconnectTrigger()` from `@blue/platform-web`:

```ts
import { createOnlineReconnectTrigger } from '@blue/platform-web';

const trigger = createOnlineReconnectTrigger();
const chat = new WebSocketClient(url, { reconnectTrigger: trigger });
// …teardown: chat.close() unsubscribes; trigger.dispose() releases it entirely
```

- Status observability — the telemetry seam: pass
  `onStatusChange: countSocketClientStatus()` (from `@blue/telemetry-web`)
  to count `connecting/open/reconnecting/closed` transitions, or any
  observer of your own (a throwing observer cannot wedge the client).

## STOMP (AD-23)

The same package hosts the protocol layer: the frame codec plus the two
sides of the wire.

**Server** — `StompBroker` runs the STOMP 1.2 endpoint protocol over any
`SocketSession` (CONNECT negotiation, SUBSCRIBE/UNSUBSCRIBE, SEND,
ACK/NACK, receipts, ERROR + close) and owns the destination namespace:

```ts
import { StompBroker } from '@blue/socket';

const broker = new StompBroker();

@stompMapping('/chat')
@parameters({ session: socketSession('session') })
async chat(session: SocketSession) {
    await broker.handleSocket(session);
}

@scheduled('*/2 * * * * *')
tick() {
    broker.publish('/topic/chat', JSON.stringify({ at: Date.now() }));
}
```

**Client** — `StompClient` rides any `SocketClient` (the `WebSocketClient`
above): CONNECT, per-destination subscriptions as async iterables,
receipt-resolved sends, ack modes, and automatic re-CONNECT + re-SUBSCRIBE
across socket reconnects:

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

Server-side routing beyond topics (second wave):

```ts
const broker = new StompBroker({
    resolveUser: (session) => session.attributes.user, // D10 scope binding
});
broker.sendToUser('alice', '/queue/events', JSON.stringify({ kind: 'alert' })); // /user scope
broker.publish('/queue/jobs', 'work'); // backlog; late subscribers replay it (D11)
broker.publish('/topic/bin', new Uint8Array([0, 1, 255])); // binary MESSAGE (D8)
```

Semantics and deferrals: transactions (BEGIN/COMMIT/ABORT, per-session
buffers), ack tracking + NACK redelivery (`redelivered: true`), byte-exact
binary bodies (Uint8Array), `/user` scoped routing
(`broker.sendToUser(user, destination, …)`), `/queue` bounded
store-and-forward (backlog replay); durable persistence behind `/queue`
needs the audit's store contract (post-1.0) and STOMP-over-TCP is never —
the [websockets guide §7](../../docs/guides/06-websockets.md) and
[AD-23](../../docs/decisions/2026-09-16_AD23_STOMP.md) have the full
semantics.

## Contracts

`SocketSession`, `SocketRequestSources`, `SocketSessionRegistry` are
type-only contracts consumed by the dispatcher (re-exported), the Node
server registry (`@blue/platform-node`), and handler code. See the
[websockets guide](../../docs/guides/06-websockets.md) for the full story;
design rationale in [AD-21](../../docs/decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md)
and [AD-22](../../docs/decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md).
