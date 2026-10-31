[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / rateLimit

# Function: rateLimit()

> **rateLimit**(`options`): (`target`, `context`) => `void`

Declares a rate-limit policy for a class or method (passive metadata —
enforcement is [RateLimitInterceptor](../classes/RateLimitInterceptor.md), default-on in the node
platform mapping since Wave 3 / SEC-6).

```ts
@postMapping('/login')
@rateLimit({ limit: 5, windowMs: 60_000 })
async login(credentials: unknown) { … }
```

The policy is validated at decoration time (fail loud at definition).

## Parameters

### options

[`RateLimitPolicy`](#)

## Returns

(`target`, `context`) => `void`
