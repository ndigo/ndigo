[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-5.md) / RedisRateLimiter

# Class: RedisRateLimiter

Multi-node [RateLimiter](#) on Redis (standalone 6.2+, Lua only).
One handle per namespace; construct independently in every node — the
Redis keys are the shared truth.

## Implements

- [`RateLimiter`](#)

## Constructors

### Constructor

> **new RedisRateLimiter**(`options`): `RedisRateLimiter`

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

***

### consume()

> **consume**(`key`, `policy`): `Promise`\<[`RateLimitResult`](#)\>

Accounts one request for `key` under `policy`. Implementations MUST
fail loud (`RangeError`) on malformed policies and MUST be safe for
concurrent use. The async signature is deliberate (AD-39): a shared
backend resolves its counter over a network hop.

#### Parameters

##### key

`string`

##### policy

[`RateLimitPolicy`](#)

#### Returns

`Promise`\<[`RateLimitResult`](#)\>

#### Implementation of

`RateLimiter.consume`
