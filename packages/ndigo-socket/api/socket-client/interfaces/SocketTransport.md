[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [socket-client](../README.md) / SocketTransport

# Interface: SocketTransport

The structural WHATWG `WebSocket` subset the client depends on.

`WebSocketClient` never touches transports outside this surface, which is
exactly what browsers and Node ≥24 both implement — and what the unit
transport doubles implement.

## Properties

### binaryType?

> `optional` **binaryType?**: `"blob"` \| `"arraybuffer"`

Binary frame delivery mode. Defaults to `'arraybuffer'` in the client.

***

### onclose

> **onclose**: ((`event`) => `void`) \| `null`

Called when the connection closes.

***

### onerror

> **onerror**: ((`event`) => `void`) \| `null`

Called on transport errors.

***

### onmessage

> **onmessage**: ((`event`) => `void`) \| `null`

Called for each inbound frame.

***

### onopen

> **onopen**: ((`event`) => `void`) \| `null`

Called when the connection opens.

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Initiate (or coerce) a close handshake.

#### Parameters

##### code?

`number`

Close status code (default `1000` normal).

##### reason?

`string`

Human-readable close reason.

#### Returns

`void`

***

### send()

> **send**(`data`): `void`

Send a text (or binary) frame.

#### Parameters

##### data

`string` \| `ArrayBuffer`

The frame payload.

#### Returns

`void`
