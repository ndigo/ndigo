[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / RateLimiter

# Interface: RateLimiter

Rate-limit backend contract. Implementations count request keys over
fixed windows; this is an integration point for distributed backends
(Redis) later — the in-memory reference implementation ships now.

## Properties

### kind

> `readonly` **kind**: `string`

Backend identifier e.g. `'fixed-window'`, `'redis'`.

## Methods

### consume()

> **consume**(`key`, `policy`): [`RateLimitResult`](RateLimitResult.md)

Accounts one request for `key` under `policy`. Implementations MUST
fail loud (`RangeError`) on malformed policies and MUST be safe for
concurrent use.

#### Parameters

##### key

`string`

##### policy

[`RateLimitPolicy`](RateLimitPolicy.md)

#### Returns

[`RateLimitResult`](RateLimitResult.md)
