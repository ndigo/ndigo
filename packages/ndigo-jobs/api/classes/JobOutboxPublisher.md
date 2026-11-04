[**@ndigo/jobs v0.0.1**](../README.md)

***

[@ndigo/jobs](../README.md) / JobOutboxPublisher

# Class: JobOutboxPublisher

The canonical publisher: outbox entries become jobs on a [JobQueue](JobQueue.md)
(`type` → job type, `payload` → job payload) — the transactional side
effect of `outbox.append(…)` is delivered through the durable queue.

## Since

1.0.0

## Implements

- [`OutboxPublisher`](../interfaces/OutboxPublisher.md)

## Constructors

### Constructor

> **new JobOutboxPublisher**(`queue`): `JobOutboxPublisher`

#### Parameters

##### queue

[`JobQueue`](JobQueue.md)

The queue entries are enqueued on.

#### Returns

`JobOutboxPublisher`

## Methods

### publish()

> **publish**(`entry`): `Promise`\<`void`\>

Publishes one entry.

#### Parameters

##### entry

[`OutboxEntry`](../interfaces/OutboxEntry.md)

The claimed entry.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`OutboxPublisher`](../interfaces/OutboxPublisher.md).[`publish`](../interfaces/OutboxPublisher.md#publish)
