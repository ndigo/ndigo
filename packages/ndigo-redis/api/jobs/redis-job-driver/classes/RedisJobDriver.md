[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [jobs/redis-job-driver](../README.md) / RedisJobDriver

# Class: RedisJobDriver

Durable [JobDriver](#) on Redis (standalone 7.2+; sorted sets and Lua
only). One handle per namespace; construct independently in every worker.

## Implements

- [`JobDriver`](#)

## Constructors

### Constructor

> **new RedisJobDriver**(`options`): `RedisJobDriver`

Creates a driver over the given connection and namespace.

#### Parameters

##### options

[`RedisJobDriverOptions`](../interfaces/RedisJobDriverOptions.md)

Borrowed connection, namespace, optional id factory.

#### Returns

`RedisJobDriver`

## Properties

### kind

> `readonly` **kind**: `"redis"` = `'redis'`

Backend identifier (`'redis'`).

#### Implementation of

`JobDriver.kind`

## Methods

### claim()

> **claim**(`options`): `Promise`\<`JobRecord`[]\>

Atomically leases up to `limit` eligible jobs via the claim script.

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

Seals this handle (borrowed connection untouched; idempotent). Later
operations reject with a closed-handle error.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the handle is sealed.

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

A promise that resolves once the job is removed.

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

A promise that resolves once the job is removed.

#### Implementation of

`JobDriver.fail`

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

Extends the lease of a running job via the heartbeat script.

#### Parameters

##### id

`string`

The job identifier.

##### leaseMs

`number`

New lease duration from now.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the lease is extended.

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

A promise that resolves once the job is requeued.

#### Implementation of

`JobDriver.retry`

***

### size()

> **size**(): `Promise`\<`number`\>

Number of jobs pending delivery: ready plus leased.

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

`JobDriver.size`
