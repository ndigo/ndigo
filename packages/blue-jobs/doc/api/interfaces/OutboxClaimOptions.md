[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / OutboxClaimOptions

# Interface: OutboxClaimOptions

Claim window for [OutboxStore.claimPending](OutboxStore.md#claimpending).

## Since

1.0.0

## Properties

### leaseMs?

> `optional` **leaseMs?**: `number`

Claim lease in milliseconds; default 60000.

***

### limit?

> `optional` **limit?**: `number`

Maximum entries per claim; default 100.
