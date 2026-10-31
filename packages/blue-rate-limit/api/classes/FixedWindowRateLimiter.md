[**@blue/rate-limit v0.0.1**](../README.md)

***

[@blue/rate-limit](../README.md) / FixedWindowRateLimiter

# Class: FixedWindowRateLimiter

In-memory fixed-window reference implementation: one counter per
(key, window) pair, sliding to a fresh window once `windowMs` elapses.

## Implements

- [`RateLimiter`](../interfaces/RateLimiter.md)

## Constructors

### Constructor

> **new FixedWindowRateLimiter**(`options?`): `FixedWindowRateLimiter`

#### Parameters

##### options?

###### maxEntries?

`number`

#### Returns

`FixedWindowRateLimiter`

## Properties

### kind

> `readonly` **kind**: `"fixed-window"` = `'fixed-window'`

Backend identifier e.g. `'fixed-window'`, `'redis'`.

#### Implementation of

[`RateLimiter`](../interfaces/RateLimiter.md).[`kind`](../interfaces/RateLimiter.md#kind)

## Methods

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](../interfaces/RateLimitResult.md)\>

Accounts one request for `key` under `policy`. Implementations MUST
fail loud (`RangeError`) on malformed policies and MUST be safe for
concurrent use. The async signature is deliberate (AD-39): a shared
backend resolves its counter over a network hop.

#### Parameters

##### key

`string`

##### policy

[`RateLimitPolicy`](../interfaces/RateLimitPolicy.md)

#### Returns

`Promise`\<[`RateLimitResult`](../interfaces/RateLimitResult.md)\>

#### Implementation of

[`RateLimiter`](../interfaces/RateLimiter.md).[`consume`](../interfaces/RateLimiter.md#consume)
