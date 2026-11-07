[**@ndigo/rate-limit v0.0.1**](../../README.md)

***

[@ndigo/rate-limit](../../README.md) / [rate-limiter](../README.md) / RateLimiter

# Interface: RateLimiter

Rate-limit backend contract. Implementations count request keys over
fixed windows; the in-memory reference (single process) and the Redis
driver (shared store, multi-process — AD-79) implement the same
semantics.

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier e.g. `'fixed-window'`, `'redis'`.

## Methods

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](RateLimitResult.md)\>

Accounts one request for `key` under `policy`. Implementations MUST
fail loud (`RangeError`) on malformed policies and MUST be safe for
concurrent use. The async signature is deliberate (AD-39): a shared
backend resolves its counter over a network hop.

#### Parameters

##### key

`string`

The client key whose budget is consumed.

##### policy

[`RateLimitPolicy`](RateLimitPolicy.md)

The window and limit to enforce.

#### Returns

`Promise`\<[`RateLimitResult`](RateLimitResult.md)\>

Whether the request may proceed and, when denied, the wait before retry.
