[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / ResolvedJobRequest

# Interface: ResolvedJobRequest

A normalized request as stored by a driver: `runAt` and `maxAttempts`
are resolved, and `delayMs` is gone.

## Since

1.0.0

## Properties

### maxAttempts

> **maxAttempts**: `number`

***

### payload

> **payload**: `unknown`

***

### runAt

> **runAt**: `number`

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

***

### type

> **type**: `string`
