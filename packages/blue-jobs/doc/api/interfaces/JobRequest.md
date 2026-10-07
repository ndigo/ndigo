[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / JobRequest

# Interface: JobRequest

A producer-supplied request to enqueue one job.

Either `delayMs` or `runAt` may be given (not both): the two spellings of
"do not run before". `payload` must be JSON-serializable — drivers fail
loud at enqueue on functions, symbols, bigints, and circular structures.

## Since

1.0.0

## Properties

### delayMs?

> `optional` **delayMs?**: `number`

Relative delay before the job is eligible (milliseconds).

***

### maxAttempts?

> `optional` **maxAttempts?**: `number`

Attempts allowed before the job is failed terminally; default 3.

***

### payload?

> `optional` **payload?**: `unknown`

JSON-serializable payload handed to the handler.

***

### runAt?

> `optional` **runAt?**: `number`

Absolute earliest run time (epoch milliseconds).

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-execution timeout handed to the handler as an abort signal.

***

### type

> **type**: `string`

Job type, matched against registered `@jobHandler` types.
