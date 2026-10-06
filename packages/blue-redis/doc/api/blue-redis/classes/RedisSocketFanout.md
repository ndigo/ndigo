[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-2.md) / RedisSocketFanout

# Class: RedisSocketFanout

Redis Pub/Sub live fan-out: at-most-once, no replay, reconnect, or offline queue.

## Implements

- [`SocketFanout`](#)

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

***

### connect()

> **connect**(): `Promise`\<`void`\>

Explicit readiness; construction never opens sockets.

#### Returns

`Promise`\<`void`\>

***

### publish()

> **publish**(`scope`, `message`): `Promise`\<`void`\>

#### Parameters

##### scope

[`SocketFanoutScope`](#)

##### message

[`SocketFanoutMessage`](#)

#### Returns

`Promise`\<`void`\>

#### Implementation of

`SocketFanout.publish`

***

### subscribe()

> **subscribe**(`scope`, `receive`): `Promise`\<() => `Promise`\<`void`\>\>

#### Parameters

##### scope

[`SocketFanoutScope`](#)

##### receive

(`message`) => `void`

#### Returns

`Promise`\<() => `Promise`\<`void`\>\>

#### Implementation of

`SocketFanout.subscribe`
