[**@blue/resilience v0.0.1**](../README.md)

***

[@blue/resilience](../README.md) / retry

# Variable: retry

> `const` **retry**: `AnnotationKey`\<[`RetrySpec`](../interfaces/RetrySpec.md)\>

`@retry` annotation key: methods carrying a [RetrySpec](../interfaces/RetrySpec.md) are retried
by a registered [RetryInterceptor](../classes/RetryInterceptor.md).

```ts
class PushAPI {
    @retry({ attempts: 3, backoff: exponentialBackoff({ initialMs: 100 }) })
    push(payload: PushPayload): Promise<void> {}
}
```

The advice is async: through a woven proxy a `@retry`-advised **sync**
method returns a Promise even though its declared type is not (the
annotation is invisible to the type system). Prefer advising
Promise-returning methods.
