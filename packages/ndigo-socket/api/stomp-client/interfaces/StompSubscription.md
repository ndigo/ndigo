[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [stomp-client](../README.md) / StompSubscription

# Interface: StompSubscription

A live subscription: an async iterable of MESSAGE frames.

## Properties

### destination

> `readonly` **destination**: `string`

The destination this subscription is bound to.

***

### id

> `readonly` **id**: `string`

The client-chosen subscription id (server-echoed on MESSAGE).

***

### messages

> `readonly` **messages**: `AsyncIterable`\<[`StompMessage`](StompMessage.md)\<`unknown`\>\>

Delivered MESSAGE frames, in order. Stalls across reconnects.

## Methods

### ack()

> **ack**(`messageId`): `void`

Send an ACK frame for a delivered message (client acks, §1.4).

#### Parameters

##### messageId

`string`

The delivered message id.

#### Returns

`void`

***

### nack()

> **nack**(`messageId`): `void`

Send a NACK frame for a delivered message (§1.4).

#### Parameters

##### messageId

`string`

The delivered message id.

#### Returns

`void`

***

### unsubscribe()

> **unsubscribe**(): `void`

Send UNSUBSCRIBE + complete the stream. Idempotent.

#### Returns

`void`
