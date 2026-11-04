[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / StompClient

# Class: StompClient

STOMP 1.2 client over any [SocketClient](../interfaces/SocketClient.md) (AD-23).

## Example

```ts
const socket = new WebSocketClient('ws://localhost:3000/stomp/chat');
const stomp = new StompClient(socket, { host: 'localhost:3000' });

const sub = stomp.subscribe('/topic/chat');
for await (const message of sub.messages) {
    console.log(message.json());
}
stomp.send('/topic/chat', JSON.stringify({ hello: 'world' }));
```

## Constructors

### Constructor

> **new StompClient**(`socket`, `options?`): `StompClient`

#### Parameters

##### socket

[`SocketClient`](../interfaces/SocketClient.md)

The underlying connection (any `SocketClient`).

##### options?

[`StompClientOptions`](../interfaces/StompClientOptions.md) = `{}`

CONNECT headers and lifecycle policy.

#### Returns

`StompClient`

## Properties

### connected

> `readonly` **connected**: `Signal`\<`boolean`\>

Reactive STOMP-session state: connected after CONNECTED.

## Accessors

### closed

#### Get Signature

> **get** **closed**(): `AsyncIterable`\<`void`\>

Completes on deliberate `disconnect()` or the socket going `closed`.

##### Returns

`AsyncIterable`\<`void`\>

## Methods

### disconnect()

> **disconnect**(): `void`

Deliberate teardown: DISCONNECT (when connected), then close the
underlying socket. Never reconnects, completes every subscription
stream, and rejects outstanding receipts.

#### Returns

`void`

***

### send()

> **send**(`destination`, `body`, `headers?`): `Promise`\<`void`\>

Send a message to a destination. Strings are sent as-is;
`Uint8Array`/`ArrayBuffer` bodies go as binary (D8); any other
value is JSON-encoded — parity with `SocketClient.send`.

The returned promise resolves when the broker RECEIPTs the frame
(a fresh `receipt` header is attached), or rejects on a server
ERROR / session end. Resolving on the wire, not just on send. A
transport drop settles it too when the frame already left the wire —
the new STOMP session cannot receipt the old id (COR-12); a frame
buffered for the new session resolves there.

#### Parameters

##### destination

`string`

The destination (e.g. `/topic/chat`).

##### body

`unknown`

The message body.

##### headers?

`Record`\<`string`, `string`\> = `{}`

Extra headers (`content-type`, caller-supplied
  `receipt`, …). A `receipt` id a pending send already carries
  rejects this send with a `StompProtocolError` — reusing it would
  overwrite the receipt correlation and strand the first promise;
  the id is reusable once its RECEIPT settles.

#### Returns

`Promise`\<`void`\>

A promise resolving on RECEIPT.

***

### subscribe()

> **subscribe**(`destination`, `opts?`): [`StompSubscription`](../interfaces/StompSubscription.md)

Subscribe to a destination.

The returned iterable receives MESSAGE frames for this subscription
only (routed by the `subscription` header). It stalls across
reconnects — the client re-SUBSCRIBEs with the same id and delivery
resumes. It completes on `unsubscribe()` or session end.

#### Parameters

##### destination

`string`

The destination (e.g. `/topic/chat`).

##### opts?

Subscription policy (`id` defaults to an opaque uuid;
  `ack` defaults to `auto`).

###### ack?

[`StompAckMode`](../type-aliases/StompAckMode.md)

###### id?

`string`

#### Returns

[`StompSubscription`](../interfaces/StompSubscription.md)

The subscription handle.

#### Throws

[StompProtocolError](StompProtocolError.md) when the session has ended
  (disconnect, ERROR, transport closed) — a new subscription could
  never receive frames.
