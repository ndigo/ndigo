[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox](../README.md) / JobOutboxPublisher

# Class: JobOutboxPublisher

The canonical publisher: outbox entries become jobs on a [JobQueue](../../job-queue/classes/JobQueue.md)
(`type` → job type, `payload` → job payload) — the transactional side
effect of `outbox.append(…)` is delivered through the durable queue.

## Implements

- [`OutboxPublisher`](../interfaces/OutboxPublisher.md)

## Constructors

### Constructor

> **new JobOutboxPublisher**(`queue`): `JobOutboxPublisher`

Creates the publisher over `queue`.

#### Parameters

##### queue

[`JobQueue`](../../job-queue/classes/JobQueue.md)

The queue entries are enqueued on.

#### Returns

`JobOutboxPublisher`

## Methods

### publish()

> **publish**(`entry`): `Promise`\<`void`\>

Publishes one outbox entry as a job.

#### Parameters

##### entry

[`OutboxEntry`](../interfaces/OutboxEntry.md)

The entry to publish.

#### Returns

`Promise`\<`void`\>

A promise that resolves once the job is enqueued.

#### Implementation of

[`OutboxPublisher`](../interfaces/OutboxPublisher.md).[`publish`](../interfaces/OutboxPublisher.md#publish)
