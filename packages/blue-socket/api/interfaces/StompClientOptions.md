[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / StompClientOptions

# Interface: StompClientOptions

Options for [StompClient](../classes/StompClient.md).

## Properties

### acceptVersion?

> `optional` **acceptVersion?**: `string`

`accept-version` values offered on CONNECT (comma-separated).
Default `'1.2,1.1,1.0'` — the server negotiates the highest mutual.

***

### connectTimeoutMs?

> `optional` **connectTimeoutMs?**: `number`

CONNECT handshake timeout in ms: no CONNECTED frame within this
window ends the session (rejects outstanding sends, completes
subscription streams, invokes `onError`). One timer per handshake,
cleared as soon as the handshake settles. Default `10000`.

***

### heartBeat?

> `optional` **heartBeat?**: `string`

`heart-beat` values advertised on CONNECT. Default `'0,0'` — the
transport owns liveness (AD-23 D3).

***

### host?

> `optional` **host?**: `string`

Value for the CONNECT `host` header (STOMP 1.1+). Defaults to the
socket URL's host.

***

### login?

> `optional` **login?**: `string`

Optional `login` header on CONNECT (broker credential seam).

***

### maxPendingSends?

> `optional` **maxPendingSends?**: `number`

Bound on sends buffered while (re)connecting. A reconnect storm with
an app that keeps sending would otherwise grow the buffer (and its
receipt promises) without limit. Overflow drops the oldest send and
rejects its receipt promise. Default `10000`; `0` disables buffering
(sends while disconnected reject immediately).

***

### maxSubscriptionMessages?

> `optional` **maxSubscriptionMessages?**: `number`

Bound on queued MESSAGE frames per subscription. A consumer slower
than the broker (hidden tab, throttled renderer) otherwise lets the
queue grow without limit; while full, the newest frame is dropped
(the transport watermark posture). Default `4096`; `0` unbounded.

***

### onError?

> `optional` **onError?**: (`message`) => `void`

Error observer: invoked with the `message` header of a server ERROR
frame (and on protocol violations). All outstanding `send()`
promises reject with a `StompProtocolError` carrying the same text.

#### Parameters

##### message

`string`

#### Returns

`void`

***

### passcode?

> `optional` **passcode?**: `string`

Optional `passcode` header on CONNECT.

***

### reconnect?

> `optional` **reconnect?**: `boolean`

Whether the STOMP session rides the socket's automatic reconnects
(re-CONNECT + re-SUBSCRIBE on the next `open`). Default `true`.
`false` means an unexpected close ends the session.

Either way a drop settles the receipts of sends whose frames already
left the transport (the new STOMP session can never receipt the old
ids); sends buffered for the new session keep their promises.
