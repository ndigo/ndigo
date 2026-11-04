[**@ndigo/rate-limit v0.0.1**](../README.md)

***

[@ndigo/rate-limit](../README.md) / RATE\_LIMITER

# Variable: RATE\_LIMITER

> `const` **RATE\_LIMITER**: [`ContextToken`](#)\<[`RateLimiter`](../interfaces/RateLimiter.md)\>

Token for the application context's shared [RateLimiter](../interfaces/RateLimiter.md) bean —
`NodeAutoConfiguration` registers the in-process default under it; apps
needing a shared store override the bean (e.g. with the
`@ndigo/redis/rate-limit` driver).
