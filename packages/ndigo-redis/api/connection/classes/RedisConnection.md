[**@ndigo/redis v0.0.1**](../../README.md)

***

[@ndigo/redis](../../README.md) / [connection](../README.md) / RedisConnection

# Class: RedisConnection

Owns a URL-created client or borrows an already-ready client. Construction
never connects. Owned connections fail fast without automatic reconnect or
offline queues; call and await connect() before use. Errors are observable
through lastError and command rejections, never logged with credentials.

## Implements

- `AsyncCloseable`

## Constructors

### Constructor

> **new RedisConnection**(`options`): `RedisConnection`

Creates a connection from a URL or an already-ready client.

#### Parameters

##### options

[`RedisConnectionOptions`](../type-aliases/RedisConnectionOptions.md)

URL or borrowed client configuration.

#### Returns

`RedisConnection`

## Accessors

### lastError

#### Get Signature

> **get** **lastError**(): `Error` \| `undefined`

Most recent socket error; retained without logging secrets.

##### Returns

`Error` \| `undefined`

***

### lastErrorAt

#### Get Signature

> **get** **lastErrorAt**(): `number` \| `undefined`

`Date.now()` of the most recent observed error; `undefined` before any.

##### Returns

`number` \| `undefined`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Rejects new work, drains tracked operations, then closes only owned clients.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the connection is closed.

#### Implementation of

`AsyncCloseable.close`

***

### connect()

> **connect**(): `Promise`\<`void`\>

Idempotent explicit connection; failed startup remains a rejected promise.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the client is ready.

***

### run()

> **run**\<`T`\>(`operation`): `Promise`\<`T`\>

Executes one adapter operation and tracks its entire lifetime for close.
Borrowed client reconnect/queue policy remains the application's policy;
new operations require readiness and never become cache misses on failure.

#### Type Parameters

##### T

`T`

#### Parameters

##### operation

(`client`) => `Promise`\<`T`\>

The adapter operation to execute with the ready client.

#### Returns

`Promise`\<`T`\>

The operation's result.
