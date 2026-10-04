[**@blue/resilience v0.0.1**](../README.md)

***

[@blue/resilience](../README.md) / exponentialBackoff

# Function: exponentialBackoff()

> **exponentialBackoff**(`options`): [`BackoffPolicy`](../interfaces/BackoffPolicy.md)

Exponential growth: `initialMs * factor^(attempt - 1)`, capped at `maxMs`
when provided.

## Parameters

### options

[`ExponentialBackoffOptions`](../interfaces/ExponentialBackoffOptions.md)

The growth configuration.

## Returns

[`BackoffPolicy`](../interfaces/BackoffPolicy.md)
