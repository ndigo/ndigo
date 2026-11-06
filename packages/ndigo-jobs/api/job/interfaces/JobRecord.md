[**@ndigo/jobs v0.0.1**](../../README.md)

***

[@ndigo/jobs](../../README.md) / [job](../README.md) / JobRecord

# Interface: JobRecord

A stored job as returned by a driver — the record handed to
`JobDriver.claim` callers and into handler execution.

## Properties

### attempts

> **attempts**: `number`

Attempts claimed so far (1 while the first execution runs).

***

### createdAt

> **createdAt**: `number`

Enqueue time (epoch milliseconds).

***

### id

> **id**: `string`

***

### lastError?

> `optional` **lastError?**: `string`

Error message of the most recent failed attempt, when any.

***

### maxAttempts

> **maxAttempts**: `number`

***

### payload

> **payload**: `unknown`

***

### runAt

> **runAt**: `number`

Earliest run time (epoch milliseconds).

***

### timeoutMs?

> `optional` **timeoutMs?**: `number`

***

### type

> **type**: `string`

