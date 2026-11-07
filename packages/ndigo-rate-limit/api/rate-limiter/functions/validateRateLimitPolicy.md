[**@ndigo/rate-limit v0.0.1**](../../README.md)

***

[@ndigo/rate-limit](../../README.md) / [rate-limiter](../README.md) / validateRateLimitPolicy

# Function: validateRateLimitPolicy()

> **validateRateLimitPolicy**(`policy`, `where?`): `void`

Validates a [RateLimitPolicy](../interfaces/RateLimitPolicy.md) — shared by the `@rateLimit`
decorator (decoration-time) and every limiter (call-time).

## Parameters

### policy

[`RateLimitPolicy`](../interfaces/RateLimitPolicy.md)

The policy to validate.

### where?

`string` = `'rate limit policy'`

Label used in the thrown error (defaults to `"rate limit policy"`).

## Returns

`void`

Nothing; throws on an invalid policy.

## Throws

When `limit` or `windowMs` is not a positive integer.

## Example

```ts
validateRateLimitPolicy({ limit: 100, windowMs: 60_000 });
```
