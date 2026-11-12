[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [index](../README.md) / SocketSessionRegistry

# Interface: SocketSessionRegistry

Tracks live WebSocket sessions and broadcasts to them (AD-21 D3/D5).

Sessions auto-join the set keyed by their endpoint path
(`broadcast('/ws/room', …)` reaches every session upgraded at that path,
zero setup); finer grouping is available through named rooms via
[SocketSession.join](SocketSession.md#join)/[SocketSession.leave](SocketSession.md#leave).

This is a **type-only contract**: the dispatcher's execution path never
references it. Implementations (e.g. the Node transport) are registered
as application-context entries; any service with the registry can push to
a room (scheduler → room, HTTP → room) — AD-21 D4.

## Methods

### broadcast()

> **broadcast**(`path`, `payload`): `Promise`\<`void`\>

Send a payload to every open session at the given endpoint path.

Payload parity with `SocketSession.send`: strings are sent as text
frames; any other value is JSON-encoded. Best-effort fan-out —
sessions that close mid-broadcast are skipped and transport write
errors are tolerated (D5).
Await transport acceptance when cross-node fan-out is configured;
backend failures reject. This does not acknowledge peer delivery.

#### Parameters

##### path

`string`

The routing path (e.g. `/ws/room`).

##### payload

`unknown`

The payload to send.

#### Returns

`Promise`\<`void`\>

***

### broadcastTo()

> **broadcastTo**(`room`, `payload`): `Promise`\<`void`\>

Send a payload to every session in the named room
(`session.join(room)` — D5).
Await acceptance; configured backend failures reject.

#### Parameters

##### room

`string`

The room name.

##### payload

`unknown`

The payload to send.

#### Returns

`Promise`\<`void`\>

***

### closeAll()

> **closeAll**(`code?`, `reason?`): `void`

Close every open session.

#### Parameters

##### code?

`number`

Close status code (default `1001` going away).

##### reason?

`string`

Human-readable close reason.

#### Returns

`void`

***

### count()

> **count**(`path`): `number`

Number of open sessions at the given endpoint path.

#### Parameters

##### path

`string`

The routing path.

#### Returns

`number`

The session count.

***

### join()

> **join**(`session`, `room`): `void`

Add a session to a named room.

#### Parameters

##### session

[`SocketSession`](SocketSession.md)

The session to add.

##### room

`string`

The room name.

#### Returns

`void`

***

### leave()

> **leave**(`session`, `room`): `void`

Remove a session from a named room.

#### Parameters

##### session

[`SocketSession`](SocketSession.md)

The session to remove.

##### room

`string`

The room name.

#### Returns

`void`

***

### remove()

> **remove**(`session`): `void`

Drop a session from the registry. Idempotent; called by the
transport when a connection closes (peer or server initiated).

#### Parameters

##### session

[`SocketSession`](SocketSession.md)

The session to remove.

#### Returns

`void`

***

### sessions()

> **sessions**(`path`): readonly [`SocketSession`](SocketSession.md)[]

Sessions open at the given endpoint path (auto-join set, D5).

#### Parameters

##### path

`string`

The routing path (e.g. `/ws/room`).

#### Returns

readonly [`SocketSession`](SocketSession.md)[]

The matching open sessions.
