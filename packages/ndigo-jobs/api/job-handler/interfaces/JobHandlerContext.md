[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job-handler](../README.md) / JobHandlerContext

# Interface: JobHandlerContext

Execution context handed to a handler alongside the payload.

## Since

1.0.0

## Properties

### attempt

> **attempt**: `number`

The attempt being executed (1 for the first).

***

### jobId

> **jobId**: `string`

The claimed job's identifier.

***

### signal

> **signal**: `AbortSignal`

Aborted when the execution exceeds `timeoutMs`. Cooperative: a handler
that ignores the signal is still settled as failed by the runner.

***

### type

> **type**: `string`

The job type.
