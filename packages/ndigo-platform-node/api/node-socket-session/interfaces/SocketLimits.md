[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session](../README.md) / SocketLimits

# Interface: SocketLimits

Tunable bounds for the WebSocket transport (frames + inbound buffering).

## Properties

### maxBufferedBytes?

> `optional` **maxBufferedBytes?**: `number`

Outbound watermark in bytes: a subscriber whose transport has more
than this many bytes buffered is handled per `onOverflow`. The
slow-consumer guard for **every** send path (direct
`SocketSession.send`, handler pumps, STOMP fan-out) — not just the
registry's broadcast (default `1_048_576` — 1 MiB, matching the
registry's default policy). `0` disables the watermark.

***

### maxPayloadBytes?

> `optional` **maxPayloadBytes?**: `number`

Maximum WS frame payload in bytes. Frames larger than this are
rejected by `ws` with close `1009` (default `1_048_576` — 1 MiB).

***

### maxQueuedBytes?

> `optional` **maxQueuedBytes?**: `number`

Maximum inbound bytes queued per session awaiting the handler
(cumulative payload size; `sizeOf` parity with the wire). Caps the
real memory cost of a stalled handler regardless of message count:
`maxQueuedMessages` alone allows `count × maxPayloadBytes` pinning
(default `4_194_304` — 4 MiB). `0` disables the byte budget.

***

### maxQueuedMessages?

> `optional` **maxQueuedMessages?**: `number`

Maximum inbound messages queued per session awaiting the handler.
A slow handler fills the queue; overflow closes the session with
`1013` — the inbound mirror of the registry's outbound watermark
(default `1024` messages).

***

### onOverflow?

> `optional` **onOverflow?**: `"close"` \| `"drop"`

What happens to over-watermark outbound: `close` (default) closes
the session with `1013` ("try again later"); `drop` silently skips
the frame. Mirrors `SocketBackpressurePolicy.onOverflow`.
