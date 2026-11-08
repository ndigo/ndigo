[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job](../README.md) / ResolvedJobRequest

# Interface: ResolvedJobRequest

A normalized request as stored by a driver: `runAt` and `maxAttempts`
are resolved, and `delayMs` is gone.

## Properties

### maxAttempts

> **maxAttempts**: `number`

Attempts allowed before terminal failure.

***

### payload

> **payload**: `unknown`

JSON-serializable payload handed to the handler.

***

### runAt

> **runAt**: `number`

Absolute earliest run time (epoch milliseconds).

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

Per-execution timeout, when configured.

***

### type

> **type**: `string`

Job type, matched against registered `@jobHandler` types.
