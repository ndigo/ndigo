[**@blue/redis v0.0.1**](../../README.md)

***

[@blue/redis](../../README.md) / [blue-redis](../README-5.md) / RedisRateLimiterOptions

# Interface: RedisRateLimiterOptions

Options for [RedisRateLimiter](../classes/RedisRateLimiter.md).

## Properties

### connection

> **connection**: [`RedisConnection`](../classes/RedisConnection.md)

Borrowed connection (already connected or connected by the application).

***

### namespace

> **namespace**: `string`

Application/environment namespace; isolates limit spaces sharing one Redis.

***

### onError?

> `optional` **onError?**: `"fail-closed"` \| `"fail-open"`

Storage-failure posture. `'fail-closed'` (default) rejects the
consume — the request fails instead of passing unthrottled;
`'fail-open'` logs through `@blue/log` and allows.
