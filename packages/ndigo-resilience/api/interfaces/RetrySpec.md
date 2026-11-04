[**@ndigo/resilience v0.0.1**](../README.md)

***

[@ndigo/resilience](../README.md) / RetrySpec

# Interface: RetrySpec

Retry policy for one method. **Idempotency is the caller's contract**
(AD-43 D-3): retrying re-invokes the join point, so a non-idempotent call
must constrain [RetrySpec.retryable](#retryable).

## Properties

### attempts?

> `optional` **attempts?**: `number`

Total call attempts, first attempt included. Defaults to
[DEFAULT\_RETRY\_ATTEMPTS](../variables/DEFAULT_RETRY_ATTEMPTS.md). Must be a positive integer —
invalid values fail loudly at weave time.

***

### backoff?

> `optional` **backoff?**: [`BackoffPolicy`](BackoffPolicy.md)

Delay before each retry attempt (1-based attempt number). Defaults to
no delay (`fixedBackoff(0)`).

***

### retryable?

> `optional` **retryable?**: (`error`) => `boolean`

Which errors are worth retrying. Defaults to every error except
[CircuitOpenError](../classes/CircuitOpenError.md) — failing fast must not be beaten by retry
backoff, so an open circuit is never retried by default.

#### Parameters

##### error

`unknown`

#### Returns

`boolean`
