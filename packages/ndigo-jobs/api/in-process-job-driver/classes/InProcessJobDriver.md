[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [in-process-job-driver](../README.md) / InProcessJobDriver

# Class: InProcessJobDriver

Map-backed [JobDriver](../../job-driver/interfaces/JobDriver.md) with the full contract semantics — `runAt`
ordering, attempts-at-claim, lease expiry reclaimed inside `claim`, and
terminal `complete`/`fail`.

**Not durable**: jobs vanish with the process. It is the zero-wiring default
for development and tests; register a durable driver (`LibSQLJobStore`,
`RedisJobDriver`) for work that must survive a restart (AD-72 D-1).

Payloads round-trip through JSON like every driver, so handlers see the
same shape they would after a restart.

## Implements

- [`JobDriver`](../../job-driver/interfaces/JobDriver.md)

## Constructors

### Constructor

> **new InProcessJobDriver**(`options?`): `InProcessJobDriver`

Creates a driver with optional clock/id overrides.

#### Parameters

##### options?

[`InProcessJobDriverOptions`](../interfaces/InProcessJobDriverOptions.md) = `{}`

Clock/id overrides for deterministic tests.

#### Returns

`InProcessJobDriver`

## Properties

### kind

> `readonly` **kind**: `"in-process"` = `'in-process'`

Backend identifier (`'in-process'`).

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`kind`](../../job-driver/interfaces/JobDriver.md#kind)

## Methods

### claim()

> **claim**(`options`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)[]\>

Atomically leases up to `limit` eligible jobs, reclaiming expired leases
first.

#### Parameters

##### options

[`ClaimOptions`](../../job/interfaces/ClaimOptions.md)

Claim window.

#### Returns

`Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)[]\>

The claimed records (possibly empty).

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`claim`](../../job-driver/interfaces/JobDriver.md#claim)

***

### close()

> **close**(): `Promise`\<`void`\>

Releases the driver's in-memory jobs; idempotent.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the driver is closed.

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`close`](../../job-driver/interfaces/JobDriver.md#close)

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

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`complete`](../../job-driver/interfaces/JobDriver.md#complete)

***

### enqueue()

> **enqueue**(`request`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

Stores one job and makes it eligible at its resolved `runAt`.

#### Parameters

##### request

[`JobRequest`](../../job/interfaces/JobRequest.md)

The producer-supplied job request.

#### Returns

`Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

The stored record.

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`enqueue`](../../job-driver/interfaces/JobDriver.md#enqueue)

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

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`fail`](../../job-driver/interfaces/JobDriver.md#fail)

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

Extends the lease of a running job; a no-op when the lease is no longer
valid.

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

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`heartbeat`](../../job-driver/interfaces/JobDriver.md#heartbeat)

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

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`retry`](../../job-driver/interfaces/JobDriver.md#retry)

***

### size()

> **size**(): `Promise`\<`number`\>

Number of jobs pending delivery: queued plus leased (running).

#### Returns

`Promise`\<`number`\>

The pending count.

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`size`](../../job-driver/interfaces/JobDriver.md#size)
