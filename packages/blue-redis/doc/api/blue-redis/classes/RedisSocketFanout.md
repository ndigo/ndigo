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

### lastError

#### Get Signature

> **get** **lastError**(): `Error` \| `undefined`

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
