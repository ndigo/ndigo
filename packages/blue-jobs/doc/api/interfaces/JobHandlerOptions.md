[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobHandlerOptions

# Interface: JobHandlerOptions

Per-handler policy overrides. Either value, when set, wins over the
per-request value stored on the job record (AD-72 D-4).

## Since

1.0.0

## Extended by

- [`JobHandlerMetadata`](JobHandlerMetadata.md)

## Properties

### maxAttempts?

> `optional` **maxAttempts?**: `number`

Attempts allowed before the job is failed terminally.

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-execution timeout handed to the handler as an abort signal.
