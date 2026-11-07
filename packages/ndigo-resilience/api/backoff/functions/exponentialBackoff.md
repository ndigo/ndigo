[**@ndigo/resilience v0.0.1**](../../README.md)

***

[@ndigo/resilience](../../README.md) / [backoff](../README.md) / exponentialBackoff

# Function: exponentialBackoff()

> **exponentialBackoff**(`options`): [`BackoffPolicy`](../interfaces/BackoffPolicy.md)

Exponential growth: `initialMs * factor^(attempt - 1)`, capped at `maxMs`
when provided, with optional multiplicative jitter.

Options are validated at construction: a `NaN`/negative `initialMs`
silently disables backoff (`NaN` delays schedule the next attempt on the
next tick), which is exactly the misconfiguration this throws on.

## Parameters

### options

[`ExponentialBackoffOptions`](../interfaces/ExponentialBackoffOptions.md)

The growth configuration.

## Returns

[`BackoffPolicy`](../interfaces/BackoffPolicy.md)

A policy that grows the delay exponentially per attempt.

## Throws

When an option is not a finite, in-range number.

## Example

```ts
const policy = exponentialBackoff({ initialMs: 100, maxMs: 5_000, jitter: 0.2 });
policy.delay(1); // ~100ms (±20%)
policy.delay(3); // ~400ms (±20%)
```
