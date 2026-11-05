[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/retry-interceptor](../README.md) / RetryInit

# Type Alias: RetryInit

> **RetryInit** = [`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md) & `object`

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

### retryMethods?

> `optional` **retryMethods?**: [`HTTPMethod`](../../../http-types/type-aliases/HTTPMethod.md)[]

HTTP methods that are eligible for retry.
Defaults to the idempotent set (RFC 9110 §9.2.2): `GET`, `HEAD`,
`OPTIONS`, `PUT`, `DELETE`, `TRACE`. Replaying a non-idempotent request
(e.g. `POST`) is opt-in. An explicit empty array means every method is
eligible.

### retryStatusCodes?

> `optional` **retryStatusCodes?**: `number`[]

HTTP status codes that are eligible for retry.
Defaults to the transient/retryable set (`408`, `429`, `500`, `502`,
`503`, `504`). An explicit empty array means every status is eligible.
