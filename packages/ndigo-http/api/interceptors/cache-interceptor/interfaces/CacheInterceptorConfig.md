[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/cache-interceptor](../README.md) / CacheInterceptorConfig

# Interface: CacheInterceptorConfig

Configuration options for the CacheInterceptor.

## Properties

### cacheBustingHeaders?

> `optional` **cacheBustingHeaders?**: `string`[]

Headers that, if present in the request, will bypass the cache.

#### Default

```ts
['Cache-Control: no-cache']
```

***

### defaultTtl?

> `optional` **defaultTtl?**: `number`

The default time-to-live for cached responses in milliseconds.

#### Default

```ts
300000 (5 minutes)
```

***

### maxCacheSize?

> `optional` **maxCacheSize?**: `number`

The maximum number of responses to store in the cache.

#### Default

```ts
100
```
