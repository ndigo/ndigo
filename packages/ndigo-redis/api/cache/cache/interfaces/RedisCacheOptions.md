[**@ndigo/redis v0.0.1**](../../../README.md)

***

[@ndigo/redis](../../../README.md) / [cache/cache](../README.md) / RedisCacheOptions

# Interface: RedisCacheOptions

Redis-only policy: TTL, not memory's per-store LRU/FIFO or maxSize.

## Properties

### cacheName

> **cacheName**: `string`

Required cache name; shared across independently constructed handles.

***

### defaultTtl?

> `optional` **defaultTtl?**: `number`

Positive finite milliseconds, rounded upward to Redis millisecond precision.

***

### namespace

> **namespace**: `string`

Application/environment namespace; required and encoded independently of cacheName.
