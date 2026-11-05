[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / SocketBackpressurePolicy

# Type Alias: SocketBackpressurePolicy

> **SocketBackpressurePolicy** = `object`

Server-side fan-out backpressure policy — the slow-consumer guard
(the `bufferSizeLimit` shape).

A peer that stops reading (stalled tab, throttled network) accumulates
buffered frames in its transport buffer (`ws` `bufferedAmount`). Without a
watermark, the memory cost of a room is set by its slowest member.

## Properties

### maxBufferedBytes

> **maxBufferedBytes**: `number`

Buffer watermark in bytes. A session whose transport has **more than
this many bytes queued is handled per `onOverflow`. Default
`1_048_576` (1 MiB).

***

### onOverflow

> **onOverflow**: `"close"` \| `"drop"`

`close` (default) — close the session with `1013` ("try again later",
the `SESSION_NOT_RELIABLE` convention): bounded memory, an explicit
client-visible signal — the AD-22 client reconnects automatically.
`drop` — silently skip fan-out to that session (ordered gaps for that
consumer only).
