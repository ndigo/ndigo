[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-client](../README.md) / StompMessage

# Interface: StompMessage\<T\>

A MESSAGE frame delivered to a subscription. The body is the wire
payload verbatim — a string for text frames, bytes for binary (AD-23
D8); `json()` parses either (bytes decoded as UTF-8) on demand.

## Type Parameters

### T

`T` = `unknown`

## Properties

### body

> `readonly` **body**: `string` \| `Uint8Array`\<`ArrayBufferLike`\>

The raw message body (text or bytes, D8).

***

### destination

> `readonly` **destination**: `string`

The frame's destination.

***

### headers

> `readonly` **headers**: `Record`\<`string`, `string`\>

All frame headers (includes `destination`/`subscription`/`message-id`).

***

### messageId

> `readonly` **messageId**: `string`

The frame's `message-id` (unique per broker instance).

***

### subscription

> `readonly` **subscription**: `string`

The subscription id this frame was routed to.

## Methods

### json()

> **json**(): `T`

Parse the body as JSON (bytes decoded as UTF-8 first).

#### Returns

`T`
