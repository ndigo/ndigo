[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job](../README.md) / ClaimOptions

# Interface: ClaimOptions

Claim window for [JobDriver.claim](../../job-driver/interfaces/JobDriver.md#claim).

## Since

1.0.0

## Properties

### leaseMs

> **leaseMs**: `number`

Lease duration in milliseconds; the runner heartbeats within it.

***

### limit

> **limit**: `number`

Maximum number of jobs to claim in one call.
