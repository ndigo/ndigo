[**@ndigo/redis v0.0.1**](../../README.md)

***

[@ndigo/redis](../../README.md) / [ndigo-redis](../README.md) / RedisConnectionOptions

# Type Alias: RedisConnectionOptions

> **RedisConnectionOptions** = \{ `client?`: `never`; `connectTimeout?`: `number`; `url`: `string`; \} \| \{ `client`: [`RedisClient`](RedisClient.md); `connectTimeout?`: `never`; `url?`: `never`; \}

Explicit connection configuration; injected ready clients are always borrowed.
