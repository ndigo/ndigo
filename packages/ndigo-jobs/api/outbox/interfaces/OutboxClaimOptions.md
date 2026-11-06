[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [outbox](../README.md) / OutboxClaimOptions

# Interface: OutboxClaimOptions

Claim window for [OutboxStore.claimPending](OutboxStore.md#claimpending).

## Properties

### leaseMs?

> `optional` **leaseMs?**: `number`

Claim lease in milliseconds; default 60000.

***

### limit?

> `optional` **limit?**: `number`

Maximum entries per claim; default 100.
