[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / RetryInit

# Type Alias: RetryInit

> **RetryInit** = [`HTTPInit`](HTTPInit.md) & `object`

Configuration options for the retry interceptor.

## Type Declaration

### retryBufferInterval?

> `optional` **retryBufferInterval?**: `number`

The fixed interval (in seconds, 1–120) to wait between retries.

#### Default

```ts
0
```

### retryHeader?

> `optional` **retryHeader?**: `string`

Response header whose value (in seconds) overrides `retryBufferInterval`.
Commonly set to `'Retry-After'`.

### retryLimit?

> `optional` **retryLimit?**: `number`

The maximum number of retry attempts.

#### Default

```ts
0
```

### retryStatusCodes?

> `optional` **retryStatusCodes?**: `number`[]

HTTP status codes that are eligible for retry.
When empty or absent, all failing status codes are eligible.
