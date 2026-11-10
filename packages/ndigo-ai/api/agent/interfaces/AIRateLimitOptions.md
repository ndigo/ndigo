[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIRateLimitOptions

# Interface: AIRateLimitOptions

Per-run rate-limit policy. The limiter is the shared `@ndigo/rate-limit`
backend; the key defaults to `provider:model`.

## Properties

### key?

> `readonly` `optional` **key?**: `string`

Override the counter key (defaults to `provider:model`).

***

### limiter

> `readonly` **limiter**: [`RateLimiter`](#)

The shared rate-limiter backend.

***

### policy

> `readonly` **policy**: [`RateLimitPolicy`](#)

The window and request budget.
