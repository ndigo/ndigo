[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox](../README.md) / OutboxEntry

# Interface: OutboxEntry

One recorded side effect awaiting publication.

## Properties

### id

> **id**: `string`

Entry identifier.

***

### occurredAt

> **occurredAt**: `number`

When the producing transaction recorded the entry (epoch milliseconds).

***

### payload

> **payload**: `unknown`

JSON-serializable payload.

***

### type

> **type**: `string`

Publication type — the job type when published through [JobOutboxPublisher](../classes/JobOutboxPublisher.md).
