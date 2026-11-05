[**@ndigo/rate-limit v0.0.1**](../../README.md)

***

[@ndigo/rate-limit](../../README.md) / [fixed-window-rate-limiter](../README.md) / FixedWindowRateLimiter

# Class: FixedWindowRateLimiter

In-memory fixed-window reference implementation: one counter per
(key, window) pair, sliding to a fresh window once `windowMs` elapses.

## Implements

- [`RateLimiter`](../../rate-limiter/interfaces/RateLimiter.md)

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

[`RateLimiter`](../../rate-limiter/interfaces/RateLimiter.md).[`kind`](../../rate-limiter/interfaces/RateLimiter.md#kind)

## Methods

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](../../rate-limiter/interfaces/RateLimitResult.md)\>

Accounts one request for `key` under `policy`. Implementations MUST
fail loud (`RangeError`) on malformed policies and MUST be safe for
concurrent use. The async signature is deliberate (AD-39): a shared
backend resolves its counter over a network hop.

#### Parameters

##### key

`string`

##### policy

[`RateLimitPolicy`](../../rate-limiter/interfaces/RateLimitPolicy.md)

#### Returns

`Promise`\<[`RateLimitResult`](../../rate-limiter/interfaces/RateLimitResult.md)\>

#### Implementation of

[`RateLimiter`](../../rate-limiter/interfaces/RateLimiter.md).[`consume`](../../rate-limiter/interfaces/RateLimiter.md#consume)
