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
    bufferWhileDisconnected: { maxMessages: 100 },            // opt-in queue
    maxInboundMessages: 1024,                                 // opt-in inbound watermark
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

## Contracts

`SocketSession`, `SocketRequestSources`, `SocketSessionRegistry` are
type-only contracts consumed by the dispatcher (re-exported), the Node
server registry (`@blue/platform-node`), and handler code. See the
[websockets guide](../../docs/guides/06-websockets.md) for the full story;
design rationale in [AD-21](../../docs/decisions/2026-09-15_AD21_WEBSOCKET_SESSION_REGISTRY.md)
and [AD-22](../../docs/decisions/2026-09-15_AD22_WEBSOCKET_CLIENT.md).