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

Backend identifier (`'libsql'`).

#### Implementation of

`JobDriver.kind`

## Methods

### claim()

> **claim**(`options`): `Promise`\<`JobRecord`[]\>

Atomically leases up to `limit` eligible jobs.

#### Parameters

##### options

`ClaimOptions`

Claim window.

#### Returns

`Promise`\<`JobRecord`[]\>

The claimed records (possibly empty).

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

Removes a finished job.

#### Parameters

##### id

`string`

The job identifier.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.

#### Implementation of

`JobDriver.complete`

***

### enqueue()

> **enqueue**(`request`): `Promise`\<`JobRecord`\>

Stores one job and makes it eligible at its resolved `runAt`.

#### Parameters

##### request

`JobRequest`

The producer-supplied job request.

#### Returns

`Promise`\<`JobRecord`\>

The stored record.

#### Implementation of

`JobDriver.enqueue`

***

### fail()

> **fail**(`id`, `lastError`): `Promise`\<`void`\>

Terminally fails a job, removing it from the queue.

#### Parameters

##### id

`string`

The job identifier.

##### lastError

`string`

Message from the final failed attempt.

#### Returns

`Promise`\<`void`\>

A promise that resolves once removed.

#### Implementation of

`JobDriver.fail`

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

Extends the lease of a running job.

#### Parameters

##### id

`string`

The job identifier.

##### leaseMs

`number`

New lease duration from now.

#### Returns

`Promise`\<`void`\>

A promise that resolves once extended.

#### Implementation of

`JobDriver.heartbeat`

***

### retry()

> **retry**(`id`, `runAt`, `lastError`): `Promise`\<`void`\>

Returns a job to the queue at `runAt` with the failure recorded.

#### Parameters

##### id

`string`

The job identifier.

##### runAt

`number`

Next eligible time (epoch milliseconds).

##### lastError

`string`

Message from the failed attempt.

#### Returns

`Promise`\<`void`\>

A promise that resolves once requeued.

#### Implementation of

`JobDriver.retry`

***

### size()

> **size**(): `Promise`\<`number`\>

Number of jobs pending delivery.

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

`JobDriver.size`
