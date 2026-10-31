[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / SocketTransport

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

***

### onerror

> **onerror**: ((`event`) => `void`) \| `null`

***

### onmessage

> **onmessage**: ((`event`) => `void`) \| `null`

***

### onopen

> **onopen**: ((`event`) => `void`) \| `null`

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Initiate (or coerce) a close handshake.

#### Parameters

##### code?

`number`

##### reason?

`string`

#### Returns

`void`

***

### send()

> **send**(`data`): `void`

Send a text (or binary) frame.

#### Parameters

##### data

`string` \| `ArrayBuffer`

#### Returns

`void`
