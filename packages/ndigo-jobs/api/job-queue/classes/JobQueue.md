[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-queue](../README.md) / JobQueue

# Class: JobQueue

The producer-facing queue: `enqueue` one job, inspect `size` — nothing else
(claiming and completion belong to [JobRunner](../../job-runner/classes/JobRunner.md)).

Produces, per AD-72 D-3, a single place where defaults live: drivers
normalize and validate, the queue only fills in the configured default
`maxAttempts` and forwards.

## Since

1.0.0

## Constructors

### Constructor

> **new JobQueue**(`options?`): `JobQueue`

#### Parameters

##### options?

[`JobQueueOptions`](../interfaces/JobQueueOptions.md) = `{}`

Driver (or context resolution) and default attempts.

#### Returns

`JobQueue`

## Methods

### enqueue()

> **enqueue**(`request`): `Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

Enqueues one job.

#### Parameters

##### request

[`JobRequest`](../../job/interfaces/JobRequest.md)

The job to enqueue (see [JobRequest](../../job/interfaces/JobRequest.md)).

#### Returns

`Promise`\<[`JobRecord`](../../job/interfaces/JobRecord.md)\>

The stored record.

***

### setApplicationContext()

> **setApplicationContext**(`applicationContext`): `void`

Container injection: the context the queue resolves its driver from
when none was passed to the constructor.

#### Parameters

##### applicationContext

`ApplicationContext`

The application context.

#### Returns

`void`

***

### size()

> **size**(): `Promise`\<`number`\>

Number of jobs pending delivery (queued plus leased).

#### Returns

`Promise`\<`number`\>

The pending count.
