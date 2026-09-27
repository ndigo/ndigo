[**@blue/socket v0.0.1**](../README.md)

***

[@blue/socket](../README.md) / SocketClient

# Interface: SocketClient

The client contract — what handlers, views, and services consume.

## Properties

### messages

> `readonly` **messages**: `AsyncIterable`\<`unknown`\>

Inbound messages as an async iterable. Text frames arrive as
strings; binary frames as `ArrayBuffer`s. The stream completes only
on a **deliberate** close — unexpected drops pause, then continue
after reconnect.

***

### status

> `readonly` **status**: `Signal`\<[`SocketStatus`](../type-aliases/SocketStatus.md)\>

Reactive connection state (`@blue/signals` signal, AD-22 D3).

***

### url

> `readonly` **url**: `string`

The endpoint URL the client connects to.

## Methods

### close()

> **close**(`code?`, `reason?`): `void`

Deliberate close — never triggers a reconnect (AD-22 D3).

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

Send: strings as text frames, anything else JSON-encoded. Sent while
disconnected: queued (when `bufferWhileDisconnected` is set, overflow
drops oldest) or dropped silently.

#### Parameters

##### data

`unknown`

#### Returns

`void`
