[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [backoff](../README.md) / BackoffPolicy

# Interface: BackoffPolicy

Computes the delay before a retry attempt. `attempt` is the 1-based retry
number (the first retry after the initial failure is attempt 1). Plain
function contract — no scheduling machinery (AD-43 D-4).

## Methods

### delay()

> **delay**(`attempt`): `number`

#### Parameters

##### attempt

`number`

#### Returns

`number`
