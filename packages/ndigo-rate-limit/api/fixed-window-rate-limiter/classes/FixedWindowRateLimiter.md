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

Backend identifier (`'fixed-window'`).

#### Implementation of

[`RateLimiter`](../../rate-limiter/interfaces/RateLimiter.md).[`kind`](../../rate-limiter/interfaces/RateLimiter.md#kind)

## Methods

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](../../rate-limiter/interfaces/RateLimitResult.md)\>

Accounts one request for `key` under `policy`.

#### Parameters

##### key

`string`

The client key whose budget is consumed.

##### policy

[`RateLimitPolicy`](../../rate-limiter/interfaces/RateLimitPolicy.md)

The window and limit to enforce.

#### Returns

`Promise`\<[`RateLimitResult`](../../rate-limiter/interfaces/RateLimitResult.md)\>

Whether the request is allowed and, when denied, the wait before retry.

#### Implementation of

[`RateLimiter`](../../rate-limiter/interfaces/RateLimiter.md).[`consume`](../../rate-limiter/interfaces/RateLimiter.md#consume)
