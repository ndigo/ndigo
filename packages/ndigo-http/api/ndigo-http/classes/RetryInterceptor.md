[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / RetryInterceptor

# Class: RetryInterceptor

Retries failed HTTP requests up to a configurable limit.

Retry state is keyed on the per-request settings object (threaded into
`preRequest`/`postError` by the execution chain) rather than on the `Request`
object, because other interceptors replace the `Request` before it reaches
fetch. The undisturbed body clone captured in `preRequest` and the attempt
counter both therefore survive `new Request(...)`.

## Implements

- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)
- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new RetryInterceptor**(`config?`): `RetryInterceptor`

Creates a new retry interceptor.

#### Parameters

##### config?

[`RetryInit`](../type-aliases/RetryInit.md) = `{}`

Retry configuration.  All fields are optional and
  default to the most conservative behaviour (zero retries, idempotent
  methods, retryable statuses only).

#### Returns

`RetryInterceptor`

## Methods

### postError()

> **postError**(`error`, `request`, `http`, `settings?`): `Promise`\<`Response` \| `undefined`\>

Potentially retries the failed request according to the configured policy.

Returns `undefined` (letting the error propagate) when:
- `retryLimit` is 0 or unset
- The attempt ceiling has already been reached
- The request method is not retryable
- The response status is not retryable
- The caller has already aborted the request

#### Parameters

##### error

`Error`

The error thrown during the request.

##### request

`Request`

The original request object.

##### http

[`HTTP`](HTTP.md)

The owning HTTP client used to issue the retry.

##### settings?

[`HTTPInit`](../type-aliases/HTTPInit.md)

The per-request settings object carrying the stable
  retry identity and the out-of-band attempt counter.

#### Returns

`Promise`\<`Response` \| `undefined`\>

A promise that resolves to the retried response, or `undefined`.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)

***

### preRequest()

> **preRequest**(`request`, `http`, `settings?`): `Promise`\<`void` \| `Request`\>

Captures an undisturbed clone of each outgoing request so a later
retry can re-issue it with the original body intact.

#### Parameters

##### request

`Request`

The request being sent.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

##### settings?

[`HTTPInit`](../type-aliases/HTTPInit.md)

The per-request settings object used as the stable
  identity for the clone (falls back to the request itself when absent).

#### Returns

`Promise`\<`void` \| `Request`\>

Nothing; the request passes through unchanged.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)
