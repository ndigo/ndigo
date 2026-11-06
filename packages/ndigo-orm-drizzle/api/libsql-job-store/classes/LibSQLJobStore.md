[**@ndigo/orm-drizzle v0.0.1**](../../README.md)

***

[@ndigo/orm-drizzle](../../README.md) / [libsql-job-store](../README.md) / LibSQLJobStore

# Class: LibSQLJobStore

Durable [JobDriver](#) on libSQL. Clients created by the store are
owned; injected clients are borrowed by default.

## Implements

- [`JobDriver`](#)

## Constructors

### Constructor

> **new LibSQLJobStore**(`options?`): `LibSQLJobStore`

#### Parameters

##### options?

[`LibSQLJobStoreOptions`](../interfaces/LibSQLJobStoreOptions.md) = `{}`

A borrowed client, or url/authToken to create an owned
  client (url defaults to `':memory:'`, matching `DrizzleDataSource`).

#### Returns

`LibSQLJobStore`

## Properties

### kind

> `readonly` **kind**: `"libsql"` = `'libsql'`

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

#### Implementation of

`JobDriver.claim`

***

### close()

> **close**(): `Promise`\<`void`\>

Release this store. Idempotent; closes only owned clients. Later
operations reject with a disposed-store error, including when the
client is borrowed. Pending operations are not drained; callers must
stop and drain the runner first.

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

#### Implementation of

`JobDriver.retry`

***

### size()

> **size**(): `Promise`\<`number`\>

#### Returns

`Promise`\<`number`\>

#### Implementation of

`JobDriver.size`
