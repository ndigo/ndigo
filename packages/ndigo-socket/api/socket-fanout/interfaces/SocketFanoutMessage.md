[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [socket-fanout](../README.md) / SocketFanoutMessage

# Interface: SocketFanoutMessage

Already serialized wire payload; topic headers are application headers only.

## Properties

### body

> **body**: `string` \| `Uint8Array`\<`ArrayBufferLike`\>

Serialized wire payload.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Application headers; not transport framing.

***

### key

> **key**: `string`

Destination key (path, room, or topic).
