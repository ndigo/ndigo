[**@ndigo/rate-limit v0.0.1**](../../README.md)

***

[@ndigo/rate-limit](../../README.md) / [rate-limiter](../README.md) / likeRateLimiter

# Function: likeRateLimiter()

> **likeRateLimiter**(`value`): `value is RateLimiter`

Structural type guard for [RateLimiter](../interfaces/RateLimiter.md) — used where an entry or
option is resolved by shape instead of the [RATE\_LIMITER](../../context-tokens/variables/RATE_LIMITER.md) token.

## Parameters

### value

`unknown`

The candidate value to inspect.

## Returns

`value is RateLimiter`

`true` when the value implements the limiter contract.

## Example

```ts
if (likeRateLimiter(candidate)) {
    await candidate.consume('client-1', policy);
}
```
