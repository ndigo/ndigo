[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / WebSocketClient

# Class: WebSocketClient

WHATWG-`WebSocket`-based client with reconnect (AD-22 D3).

## Example

```ts
const chat = new WebSocketClient('ws://localhost:3000/ws/chat', {
    bufferWhileDisconnected: { maxMessages: 100 },
});
effect(() => {
    if (chat.status.value === 'open') panel.hidden = false;
});
for await (const message of chat.messages) {
    applyMessage(JSON.parse(String(message)));
}
```

## Implements

- [`SocketClient`](../interfaces/SocketClient.md)

## Constructors

### Constructor

> **new WebSocketClient**(`url`, `options?`): `WebSocketClient`

#### Parameters

##### url

`string`

The endpoint URL (e.g. `ws://host/ws/chat`).

##### options?

[`WebSocketClientOptions`](../interfaces/WebSocketClientOptions.md) = `{}`

Reconnect/buffering/trigger/transport options.

#### Returns

`WebSocketClient`

## Properties

### status

> `readonly` **status**: `Signal`\<[`SocketStatus`](../type-aliases/SocketStatus.md)\>

Reactive connection state (`@blue/signals` signal, AD-22 D3).

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`status`](../interfaces/SocketClient.md#status)

***

### url

> `readonly` **url**: `string`

The endpoint URL the client connects to.

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`url`](../interfaces/SocketClient.md#url)

## Accessors

### messages

#### Get Signature

> **get** **messages**(): `AsyncIterable`\<`unknown`\>

Inbound messages as an async iterable. Text frames arrive as
strings; binary frames as `ArrayBuffer`s. The stream completes only
on a **deliberate** close — unexpected drops pause, then continue
after reconnect.

##### Returns

`AsyncIterable`\<`unknown`\>

Inbound messages as an async iterable. Text frames arrive as
strings; binary frames as `ArrayBuffer`s. The stream completes only
on a **deliberate** close — unexpected drops pause, then continue
after reconnect.

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`messages`](../interfaces/SocketClient.md#messages)

***

### onSendWired

#### Get Signature

> **get** **onSendWired**(): `boolean`

Whether the client reports exact wire sizes through `onSend` (TEL-08).

##### Returns

`boolean`

Whether the client reports exact wire sizes through the `onSend`
observer (TEL-08). Telemetry reads this to skip its own payload
estimation for wired clients — counting both would double the byte
metric.

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`onSendWired`](../interfaces/SocketClient.md#onsendwired)

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Deliberate close — latches, cancels any pending retry, and completes
the message stream (AD-22 D3).

#### Parameters

##### code?

`number` = `1000`

Close status code (default `1000` normal).

##### reason?

`string` = `''`

Human-readable close reason.

#### Returns

`void`

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`close`](../interfaces/SocketClient.md#close)

***

### send()

> **send**(`data`): `void`

Send a message to the peer (see [SocketClient.send](../interfaces/SocketClient.md#send)).

#### Parameters

##### data

`unknown`

The payload.

#### Returns

`void`

#### Implementation of

[`SocketClient`](../interfaces/SocketClient.md).[`send`](../interfaces/SocketClient.md#send)
