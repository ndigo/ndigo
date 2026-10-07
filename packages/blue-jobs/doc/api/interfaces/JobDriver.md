[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobDriver

# Interface: JobDriver

Storage/transport contract for queued jobs (AD-72 D-2).

Semantics every driver must preserve:

- **At-least-once.** `attempts` increments at claim time, so a crashed
  delivery consumes an attempt and a reclaimed job may execute one final
  time when `attempts === maxAttempts`. A driver never loses a job silently.
- **Lease-based.** `claim` returns jobs leased for `leaseMs`; expired leases
  are reclaimed by the next `claim` call (no sweeper, no leader election).
- **JSON payloads.** `enqueue` validates serializability (see
  [serializeJobPayload](../functions/serializeJobPayload.md)) and stores text, not object graphs.
- **Terminal ends.** `complete` and `fail` remove the job from the queue;
  `fail` records the error in the caller's telemetry/log, not in storage
  (dead-letter inspection is out of scope — AD-72 D-2).

Implementations are registered under the `jobDriver` bean; the default is
[InProcessJobDriver](../classes/InProcessJobDriver.md), which is explicitly non-durable.

## Since

1.0.0

## Properties

### kind

> `readonly` **kind**: `string`

Backend discriminator (`'in-process'`, `'libsql'`, `'redis'`).

## Methods

### claim()

> **claim**(`options`): `Promise`\<[`JobRecord`](JobRecord.md)[]\>

Atomically leases up to `limit` eligible jobs: expired leases are
reclaimed first, then ready jobs (in `runAt`, then `createdAt` order)
are claimed, `attempts` is incremented, and a lease of `leaseMs` starts.

#### Parameters

##### options

[`ClaimOptions`](ClaimOptions.md)

Claim window.

#### Returns

`Promise`\<[`JobRecord`](JobRecord.md)[]\>

The claimed records (possibly empty).

***

### close()

> **close**(): `Promise`\<`void`\>

Releases driver resources (closes owned clients; idempotent). New
operations on a closed driver fail loud.

#### Returns

`Promise`\<`void`\>

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

***

### enqueue()

> **enqueue**(`request`): `Promise`\<[`JobRecord`](JobRecord.md)\>

Stores one job and makes it eligible at its resolved `runAt`.

#### Parameters

##### request

[`JobRequest`](JobRequest.md)

The producer-supplied job request.

#### Returns

`Promise`\<[`JobRecord`](JobRecord.md)\>

The stored record.

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

***

### size()

> **size**(): `Promise`\<`number`\>

Number of jobs pending delivery: queued plus leased (running).

#### Returns

`Promise`\<`number`\>

The pending count.
