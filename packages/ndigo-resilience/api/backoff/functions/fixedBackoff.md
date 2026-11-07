[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [backoff](../README.md) / fixedBackoff

# Function: fixedBackoff()

> **fixedBackoff**(`ms`): [`BackoffPolicy`](../interfaces/BackoffPolicy.md)

Constant delay for every retry attempt.

## Parameters

### ms

`number`

The fixed delay in milliseconds.

## Returns

[`BackoffPolicy`](../interfaces/BackoffPolicy.md)

A policy that waits `ms` before every retry.

## Example

```ts
const policy = fixedBackoff(250);
policy.delay(1); // 250
policy.delay(2); // 250
```
