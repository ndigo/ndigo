[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / RateLimitResult

# Interface: RateLimitResult

The outcome of [RateLimiter.consume](RateLimiter.md#consume).

## Properties

### allowed

> `readonly` **allowed**: `boolean`

Whether the request may proceed.

***

### retryAfterMs

> `readonly` **retryAfterMs**: `number`

When denied: milliseconds until the current window resets (the
basis for the `Retry-After` header). `0` when allowed.
