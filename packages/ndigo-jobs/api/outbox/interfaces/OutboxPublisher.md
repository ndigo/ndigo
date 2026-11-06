[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox](../README.md) / OutboxPublisher

# Interface: OutboxPublisher

Publishes one outbox entry. Implementations must be idempotent-friendly:
a failed publish is retried after the claim lease expires.

## Methods

### publish()

> **publish**(`entry`): `Promise`\<`void`\>

Publishes one entry.

#### Parameters

##### entry

[`OutboxEntry`](OutboxEntry.md)

The claimed entry.

#### Returns

`Promise`\<`void`\>
