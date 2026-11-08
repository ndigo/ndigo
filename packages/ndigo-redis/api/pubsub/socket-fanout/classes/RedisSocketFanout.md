[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [pubsub/socket-fanout](../README.md) / RedisSocketFanout

# Class: RedisSocketFanout

Redis Pub/Sub live fan-out: at-most-once, no replay, reconnect, or offline queue.

## Implements

- [`SocketFanout`](#)
- `AsyncCloseable`

## Constructors

### Constructor

> **new RedisSocketFanout**(`options`): `RedisSocketFanout`

#### Parameters

##### options

[`RedisSocketFanoutOptions`](../interfaces/RedisSocketFanoutOptions.md)

#### Returns

`RedisSocketFanout`

## Accessors

### lastDecodeError

#### Get Signature

> **get** **lastDecodeError**(): `Error` \| `undefined`

Most recent malformed-envelope decode error; never masked by connection errors.

##### Returns

`Error` \| `undefined`

***

### lastError

#### Get Signature

> **get** **lastError**(): `Error` \| `undefined`

Most recent error across the subscriber connection, the publisher
connection, and inbound malformed-envelope decodes — compared by
observation time, so no source permanently masks another. Use
[lastDecodeError](#lastdecodeerror) to observe decode failures directly.

##### Returns

`Error` \| `undefined`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Unsubscribe all listeners, then close only the dedicated owned subscriber.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the fan-out is closed.

#### Implementation of

`AsyncCloseable.close`

***

### connect()

> **connect**(): `Promise`\<`void`\>

Explicit readiness; construction never opens sockets.

#### Returns

`Promise`\<`void`\>

A promise that resolves once publisher and subscriber are ready.

***

### publish()

> **publish**(`scope`, `message`): `Promise`\<`void`\>

Publishes one message after backend acceptance.

#### Parameters

##### scope

[`SocketFanoutScope`](#)

The fan-out scope to publish to.

##### message

[`SocketFanoutMessage`](#)

The message to publish.

#### Returns

`Promise`\<`void`\>

A promise that resolves after Redis accepts the publish.

#### Implementation of

`SocketFanout.publish`

***

### subscribe()

> **subscribe**(`scope`, `receive`): `Promise`\<() => `Promise`\<`void`\>\>

Subscribes to a scope's messages; completion signals readiness.

#### Parameters

##### scope

[`SocketFanoutScope`](#)

The fan-out scope to subscribe to.

##### receive

(`message`) => `void`

Invoked for each message from another origin.

#### Returns

`Promise`\<() => `Promise`\<`void`\>\>

An unsubscribe function.

#### Implementation of

`SocketFanout.subscribe`
