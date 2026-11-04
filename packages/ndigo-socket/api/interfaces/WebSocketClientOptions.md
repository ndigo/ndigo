[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / WebSocketClientOptions

# Interface: WebSocketClientOptions

Options for [WebSocketClient](../classes/WebSocketClient.md).

## Properties

### bufferWhileDisconnected?

> `optional` **bufferWhileDisconnected?**: `object`

Opt-in bounded outbound queue for messages sent while not `open`
(connecting/reconnecting). Overflow drops the **oldest** message.
Default: no queue — messages sent while disconnected are dropped.

#### maxMessages

> **maxMessages**: `number`

***

### maxInboundMessages?

> `optional` **maxInboundMessages?**: `number`

Opt-in bound on the inbound `messages` stream. A consumer that stops
draining (hidden tab, throttled render) otherwise lets the inbound
queue grow without limit while the transport keeps delivering. On
overflow the **newest** frame is dropped and the reader enters a
drop-all state (mirrors the server's overflow posture) — the stream
keeps draining what was queued. Default: unbounded.

***

### onSend?

> `optional` **onSend?**: (`bytes`) => `void`

Outbound-size observer: invoked with the UTF-8 byte length of every
payload actually written to the transport (direct sends and buffered
flushes alike, never for queued/dropped payloads) — the byte-counter
seam for telemetry, which would otherwise re-serialize each payload.
Constructor-injected like `onStatusChange`; a throw is isolated.

#### Parameters

##### bytes

`number`

#### Returns

`void`

***

### onStatusChange?

> `optional` **onStatusChange?**: (`status`) => `void`

Status-transition observer: invoked on every state change
(`connecting | open | reconnecting | closed`), never on construction
and not twice for the same state — the telemetry seam for status and
reconnect metrics (constructor-injected like `reconnectTrigger`).

#### Parameters

##### status

[`SocketStatus`](../type-aliases/SocketStatus.md)

#### Returns

`void`

***

### reconnect?

> `optional` **reconnect?**: [`ReconnectPolicy`](ReconnectPolicy.md) \| `null`

Reconnect policy. `null` disables auto-reconnect (an unexpected
close ends in `closed`). Omit for the default policy.

***

### reconnectTrigger?

> `optional` **reconnectTrigger?**: [`ReconnectTrigger`](ReconnectTrigger.md) \| `null`

Immediate-retry wiring (AD-22 D3); `null` disables.

***

### transportFactory?

> `optional` **transportFactory?**: (`url`) => [`SocketTransport`](SocketTransport.md)

**`Internal`**

Transport factory for tests and non-standard environments. Defaults
to the WHATWG `WebSocket` global (browser + Node ≥24).

#### Parameters

##### url

`string`

#### Returns

[`SocketTransport`](SocketTransport.md)
