[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session-registry](../README.md) / NodeSocketSessionRegistry

# Class: NodeSocketSessionRegistry

Tracks live Node WebSocket sessions and fans out to them (AD-21 D3/D5/D6).

Sessions are registered by the server adapter on connection and removed on
close. Every session auto-joins the set keyed by its endpoint path, so
`broadcast('/ws/room', …)` reaches all open sessions at that path with zero
setup; named rooms via `SocketSession.join`/`leave` provide finer grouping.
The implementation is registered as a context bean by
`NodeAutoConfiguration`; any service can inject it and push to a room.

## Implements

- `SocketSessionRegistry`
- `AsyncCloseable`

## Constructors

### Constructor

> **new NodeSocketSessionRegistry**(`options?`): `NodeSocketSessionRegistry`

Creates the registry.

#### Parameters

##### options?

[`NodeSocketSessionRegistryOptions`](../interfaces/NodeSocketSessionRegistryOptions.md) = `{}`

Heartbeat/backpressure knobs and clock.

#### Returns

`NodeSocketSessionRegistry`

## Methods

### addFanoutObserver()

> **addFanoutObserver**(`observer`): () => `void`

Subscribe to fan-out events (`broadcast`/`broadcastTo`) after the
payload has been serialized — the size seam for telemetry, so the
payload is not serialized a second time just to be measured.

#### Parameters

##### observer

(`event`) => `void`

Invoked once per fan-out.

#### Returns

An unsubscribe function (disable-time symmetry).

() => `void`

***

### addOverflowObserver()

> **addOverflowObserver**(`observer`): () => `void`

Subscribe to backpressure decisions (close or drop) after construction.
Constructor `onOverflow` is the static seam; this is the dynamic one —
e.g. telemetry instrumentations that enable after the registry exists
(disable-time symmetry via the returned unsubscribe).

#### Parameters

##### observer

(`event`) => `void`

Invoked at each backpressure decision.

#### Returns

An unsubscribe function.

() => `void`

***

### broadcast()

> **broadcast**(`path`, `payload`): `Promise`\<`void`\>

Send a payload to every open session at the given endpoint path.

Strings are sent as text frames, `Uint8Array`/`ArrayBuffer` as binary
frames, any other value is JSON-encoded — parity with
`SocketSession.send` (AD-23 D8). Best-effort fan-out: closed sessions
are skipped and transport write errors are tolerated (AD-21 D5).
Serialized once per fan-out; observers registered via
[addFanoutObserver](#addfanoutobserver) see the wire size without re-serializing.

#### Parameters

##### path

`string`

The routing path (e.g. `/ws/room`).

##### payload

`unknown`

The payload to send.

#### Returns

`Promise`\<`void`\>

Transport acceptance followed by best-effort local delivery.

#### Implementation of

`SocketSessionRegistry.broadcast`

***

### broadcastTo()

> **broadcastTo**(`room`, `payload`): `Promise`\<`void`\>

Send a payload to every session in the named room
(`session.join(room)` — AD-21 D5).

#### Parameters

##### room

`string`

The room name.

##### payload

`unknown`

The payload to send.

#### Returns

`Promise`\<`void`\>

Transport acceptance followed by best-effort local delivery.

#### Implementation of

`SocketSessionRegistry.broadcastTo`

***

### close()

> **close**(): `Promise`\<`void`\>

Release registry subscriptions and heartbeat, not the application-owned transport.

#### Returns

`Promise`\<`void`\>

A promise that resolves once closed.

#### Implementation of

`AsyncCloseable.close`

***

### closeAll()

> **closeAll**(`code?`, `reason?`): `void`

Close every open session (default `1001` going away). Removal happens
through each connection's close event.

Invalid close frames throw a `RangeError` before any session is
touched; the fan-out itself is best-effort — one session whose
transport rejects the close mid-handshake cannot abort the loop.

#### Parameters

##### code?

`number` = `1001`

Close status code (default `1001`).

##### reason?

`string` = `'server shutting down'`

Human-readable close reason.

#### Returns

`void`

#### Implementation of

`SocketSessionRegistry.closeAll`

***

### connect()

> **connect**(): `Promise`\<`void`\>

Subscribe both registry scopes once. With a configured transport, callers
must await this before publishing. A failed connection rolls back partial
subscriptions and remains observable on subsequent connect calls.

#### Returns

`Promise`\<`void`\>

A promise that resolves once connected.

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

#### Implementation of

`SocketSessionRegistry.count`

***

### join()

> **join**(`session`, `room`): `void`

Add a session to a named room.

#### Parameters

##### session

[`SocketSession`](#)

The session to add.

##### room

`string`

The room name — must be a non-empty string.

#### Returns

`void`

#### Implementation of

`SocketSessionRegistry.join`

***

### leave()

> **leave**(`session`, `room`): `void`

Remove a session from a named room. Prunes empty rooms.

#### Parameters

##### session

[`SocketSession`](#)

The session to remove.

##### room

`string`

The room name — must be a non-empty string.

#### Returns

`void`

#### Implementation of

`SocketSessionRegistry.leave`

***

### register()

> **register**(`session`, `path`, `transport`): `void`

Start tracking a session. Adapter hook — not part of the dispatcher
contract: registers the transport for heartbeat pings and attaches the
pong bookkeeping. The session auto-joins the set keyed by its endpoint
path (AD-21 D5). Idempotent.

#### Parameters

##### session

[`SocketSession`](#)

The session to track.

##### path

`string`

The endpoint path the session was upgraded at.

##### transport

`WebSocket`

The underlying `ws` connection (for pings and
  graceful reaping).

#### Returns

`void`

***

### remove()

> **remove**(`session`, `closeCode?`): `void`

Drop a session from the registry. Idempotent; called by the
transport on connection close (peer or server initiated). Also stops
the heartbeat sweep when the last session goes away.

#### Parameters

##### session

[`SocketSession`](#)

The session to remove.

##### closeCode?

`number`

WebSocket close status code when known (e.g.
  backpressure closes carry `1013`). The registry itself does not
  consume it — it is the observability seam for registry wrappers
  (the socket telemetry instrumentation reads it for close-code
  counters and session-span attributes).

#### Returns

`void`

#### Implementation of

`SocketSessionRegistry.remove`

***

### sessions()

> **sessions**(`path`): readonly [`SocketSession`](#)[]

Sessions open at the given endpoint path (auto-join set, D5).

#### Parameters

##### path

`string`

The routing path (e.g. `/ws/room`).

#### Returns

readonly [`SocketSession`](#)[]

The matching open sessions.

#### Implementation of

`SocketSessionRegistry.sessions`

***

### stop()

> **stop**(): `void`

Stop the heartbeat sweep. Idempotent; called on server close so no
timers outlive the context (graceful shutdown).

#### Returns

`void`
