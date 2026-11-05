[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [jobs/redis-job-driver](../README.md) / RedisJobDriver

# Class: RedisJobDriver

Durable [JobDriver](#) on Redis (standalone 7.2+; sorted sets and Lua
only). One handle per namespace; construct independently in every worker.

## Since

1.0.0

## Implements

- [`JobDriver`](#)

## Constructors

### Constructor

> **new RedisJobDriver**(`options`): `RedisJobDriver`

#### Parameters

##### options

[`RedisJobDriverOptions`](../interfaces/RedisJobDriverOptions.md)

Borrowed connection, namespace, optional id factory.

#### Returns

`RedisJobDriver`

## Properties

### kind

> `readonly` **kind**: `"redis"` = `'redis'`

Backend discriminator (`'in-process'`, `'libsql'`, `'redis'`).

#### Implementation of

`JobDriver.kind`

## Methods

### claim()

> **claim**(`options`): `Promise`\<`JobRecord`[]\>

#### Parameters

##### options

`ClaimOptions`

#### Returns

`Promise`\<`JobRecord`[]\>

#### Inherit Doc

#### Implementation of

`JobDriver.claim`

***

### close()

> **close**(): `Promise`\<`void`\>

Seals this handle (borrowed connection untouched; idempotent). Later
operations reject with a closed-handle error.

#### Returns

`Promise`\<`void`\>

#### Implementation of

`JobDriver.close`

***

### complete()

> **complete**(`id`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`JobDriver.complete`

***

### enqueue()

> **enqueue**(`request`): `Promise`\<`JobRecord`\>

#### Parameters

##### request

`JobRequest`

#### Returns

`Promise`\<`JobRecord`\>

#### Inherit Doc

#### Implementation of

`JobDriver.enqueue`

***

### fail()

> **fail**(`id`, `lastError`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### lastError

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`JobDriver.fail`

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### leaseMs

`number`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`JobDriver.heartbeat`

***

### retry()

> **retry**(`id`, `runAt`, `lastError`): `Promise`\<`void`\>

#### Parameters

##### id

`string`

##### runAt

`number`

##### lastError

`string`

#### Returns

`Promise`\<`void`\>

#### Inherit Doc

#### Implementation of

`JobDriver.retry`

***

### size()

> **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Inherit Doc

#### Implementation of

`JobDriver.size`
