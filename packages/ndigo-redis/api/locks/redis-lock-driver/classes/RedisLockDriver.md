[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [locks/redis-lock-driver](../README.md) / RedisLockDriver

# Class: RedisLockDriver

Multi-node `LockDriver` on Redis (standalone 6.2+, `SET NX PX` and
Lua only). One handle per namespace; construct independently in every
node — the Redis keys are the shared truth.

## Implements

- [`LockDriver`](#)

## Constructors

### Constructor

> **new RedisLockDriver**(`options`): `RedisLockDriver`

#### Parameters

##### options

[`RedisLockDriverOptions`](../interfaces/RedisLockDriverOptions.md)

Borrowed connection and namespace.

#### Returns

`RedisLockDriver`

## Properties

### kind

> `readonly` **kind**: `"redis"` = `'redis'`

Backend identifier for diagnostics.

#### Implementation of

`LockDriver.kind`

## Methods

### acquire()

> **acquire**(`key`, `options`): `Promise`\<[`LockHandle`](#) \| `null`\>

#### Parameters

##### key

`string`

##### options

###### ttlMs

`number`

#### Returns

`Promise`\<[`LockHandle`](#) \| `null`\>

#### Implementation of

`LockDriver.acquire`

***

### close()

> **close**(): `Promise`\<`void`\>

Releases this driver's own leases (token-checked — a successor's
lease is never touched) and seals the handle. The borrowed connection
is untouched; idempotent.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`LockDriver.close`
