[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / CacheInterceptorConfig

# Interface: CacheInterceptorConfig

Defined in: packages/blue-http/src/interceptors/cache-interceptor.ts:10

Configuration options for the CacheInterceptor.

## Properties

### defaultTtl?

> `optional` **defaultTtl?**: `number`

Defined in: packages/blue-http/src/interceptors/cache-interceptor.ts:15

The default time-to-live for cached responses in milliseconds.

#### Default

```ts
300000 (5 minutes)
```

***

### maxCacheSize?

> `optional` **maxCacheSize?**: `number`

Defined in: packages/blue-http/src/interceptors/cache-interceptor.ts:20

The maximum number of responses to store in the cache.

#### Default

```ts
100
```

***

### cacheBustingHeaders?

> `optional` **cacheBustingHeaders?**: `string`[]

Defined in: packages/blue-http/src/interceptors/cache-interceptor.ts:25

Headers that, if present in the request, will bypass the cache.

#### Default

```ts
['Cache-Control: no-cache']
```
