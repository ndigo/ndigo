[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / SocketSession

# Interface: SocketSession

A live WebSocket connection as seen by a socket handler.

## Properties

### attributes

> `readonly` **attributes**: `Record`\<`string`, `unknown`\>

Per-connection state bag (AD-21 D3, Micronaut/Spring/Jakarta
parity). Any value may be stored; the bag lives as long as the
session and is never shared with other sessions.

***

### closed

> `readonly` **closed**: `AsyncIterable`\<`number`\>

An async iterable that completes when the socket has closed, with the
close code (e.g. `1000` normal).

***

### cookies

> `readonly` **cookies**: `Record`\<`string`, `string`\>

Cookies from the upgrade request's `Cookie` header.

***

### headers

> `readonly` **headers**: `Record`\<`string`, `string` \| `string`[] \| `undefined`\>

Headers from the upgrade request (lower-cased names).

***

### isClosed

> `readonly` **isClosed**: `boolean`

`true` once the peer (or server) has closed the connection.

***

### messages

> `readonly` **messages**: `AsyncIterable`\<`unknown`\>

Inbound messages from the peer, as an async iterable.

Each value is the message payload: **a string for text frames, a
`Uint8Array` for binary frames** (AD-23 D8 — binary payloads surface
byte-exact; handlers that expect text decode explicitly, e.g.
`new TextDecoder().decode(bytes)`). The stream completes when the
peer closes the connection.

***

### params

> `readonly` **params**: `Record`\<`string`, `unknown`\>

Params extracted from the upgrade request via `@parameters`
extractors (query/path/header values, validated with Zod as usual).

***

### path

> `readonly` **path**: `string`

The request path the socket was upgraded from (e.g. `/chat/room`).

***

### query

> `readonly` **query**: `Record`\<`string`, `string` \| `string`[]\>

Query parameters from the upgrade request URL
(`ws://host/room?room=abc&raw=1` → `{ room: 'abc', raw: '1' }`).
Repeated parameters are arrays, matching the HTTP path.

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Close the connection.

#### Parameters

##### code?

`number`

Close status code (default `1000` normal; `1008` policy,
  `1011` server error, …).

##### reason?

`string`

Human-readable close reason.

#### Returns

`void`

***

### join()

> **join**(`room`): `void`

Join a named room (AD-21 D5). Membership is registry-backed: other
sessions (or any service with the registry) can reach this session
via `broadcastTo(room, …)`. No-op once the session is closed.

#### Parameters

##### room

`string`

The room name.

#### Returns

`void`

***

### leave()

> **leave**(`room`): `void`

Leave a named room. No-op once the session is closed (or if the
session never joined).

#### Parameters

##### room

`string`

The room name.

#### Returns

`void`

***

### send()

> **send**(`data`): `void`

Send a message to the peer. Text strings are sent as text frames; any
other value is JSON-encoded before sending.

#### Parameters

##### data

`unknown`

The payload to send.

#### Returns

`void`
