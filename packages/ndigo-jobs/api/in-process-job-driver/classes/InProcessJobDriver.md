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

## Since

1.0.0

## Implements

- [`JobDriver`](../../job-driver/interfaces/JobDriver.md)

## Constructors

### Constructor

> **new InProcessJobDriver**(`options?`): `InProcessJobDriver`

#### Parameters

##### options?

[`InProcessJobDriverOptions`](../interfaces/InProcessJobDriverOptions.md) = `{}`

Clock/id overrides for deterministic tests.

#### Returns

`InProcessJobDriver`

## Properties

### kind

> `readonly` **kind**: `"in-process"` = `'in-process'`

Backend discriminator (`'in-process'`, `'libsql'`, `'redis'`).

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`kind`](../../job-driver/interfaces/JobDriver.md#kind)

## Methods

### claim()

> **claim**(`options`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)[]\>

Atomically leases up to `limit` eligible jobs: expired leases are
reclaimed first, then ready jobs (in `runAt`, then `createdAt` order)
are claimed, `attempts` is incremented, and a lease of `leaseMs` starts.

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

Releases driver resources (closes owned clients; idempotent). New
operations on a closed driver fail loud.

#### Returns

`Promise`\<`void`\>

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

#### Implementation of

[`JobDriver`](../../job-driver/interfaces/JobDriver.md).[`fail`](../../job-driver/interfaces/JobDriver.md#fail)

***

### heartbeat()

> **heartbeat**(`id`, `leaseMs`): `Promise`\<`void`\>

Extends the lease of a running job.

**Ordering contract (AD72-M3):** the runner awaits its last in-flight
heartbeat before any terminal transition (`complete`/`retry`/`fail`),
so a driver never receives a heartbeat for a job it just removed. A
driver MUST still tolerate a heartbeat that is a no-op: another worker
may have reclaimed the lease (expired) or completed the job before the
beat lands — extending only a still-valid lease is the reference
behavior (`RedisJobDriver.HEARTBEAT_SCRIPT`), and a check-then-mutate
pair MUST be atomic (one script/statement) so a stale beat can never
re-lease a job a concurrent claim just moved.

#### Parameters

##### id

`string`

The job identifier.

##### leaseMs

`number`

New lease duration from now.

#### Returns

`Promise`\<`void`\>

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
