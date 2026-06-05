[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / RetryInit

# Type Alias: RetryInit

> **RetryInit** = [`HTTPInit`](HTTPInit.md) & `object`

Defined in: packages/blue-http/src/interceptors/retry-interceptor.ts:11

Configuration options for the retry interceptor.

## Type Declaration

### retryLimit?

> `optional` **retryLimit?**: `number`

The maximum number of retry attempts.

#### Default

```ts
0
```

### retryBufferInterval?

> `optional` **retryBufferInterval?**: `number`

The fixed interval (in seconds, 1–120) to wait between retries.

#### Default

```ts
0
```

### retryHeader?

> `optional` **retryHeader?**: `string`

Response header whose value (in seconds) overrides retryBufferInterval.
Commonly set to `'Retry-After'`.

### retryStatusCodes?

> `optional` **retryStatusCodes?**: `number`[]

HTTP status codes that are eligible for retry.
When empty or absent, all failing status codes are eligible.
