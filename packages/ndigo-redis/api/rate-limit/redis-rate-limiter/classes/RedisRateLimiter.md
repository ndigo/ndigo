[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [rate-limit/redis-rate-limiter](../README.md) / RedisRateLimiter

# Class: RedisRateLimiter

Multi-node [RateLimiter](#) on Redis (standalone 6.2+, Lua only).
One handle per namespace; construct independently in every node — the
Redis keys are the shared truth.

## Implements

- [`RateLimiter`](#)
- `AsyncCloseable`

## Constructors

### Constructor

> **new RedisRateLimiter**(`options`): `RedisRateLimiter`

Creates a limiter over the given connection and namespace.

#### Parameters

##### options

[`RedisRateLimiterOptions`](../interfaces/RedisRateLimiterOptions.md)

Borrowed connection, namespace, and failure posture.

#### Returns

`RedisRateLimiter`

## Properties

### kind

> `readonly` **kind**: `"redis"` = `'redis'`

Backend identifier for diagnostics.

#### Implementation of

`RateLimiter.kind`

## Methods

### close()

> **close**(): `Promise`\<`void`\>

Seals this driver; a closed driver accepts no operations. The
borrowed connection is untouched; idempotent.

#### Returns

`Promise`\<`void`\>

A promise that resolves once sealed.

#### Implementation of

`AsyncCloseable.close`

***

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](#)\>

Accounts one request for `key` under `policy`.

#### Parameters

##### key

`string`

The client key whose budget is consumed.

##### policy

[`RateLimitPolicy`](#)

The window and limit to enforce.

#### Returns

`Promise`\<[`RateLimitResult`](#)\>

Whether the request is allowed and, when denied, the wait before retry.

#### Implementation of

`RateLimiter.consume`
