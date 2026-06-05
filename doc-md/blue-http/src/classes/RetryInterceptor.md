[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / RetryInterceptor

# Class: RetryInterceptor

Defined in: packages/blue-http/src/interceptors/retry-interceptor.ts:55

Retries failed HTTP requests up to a configurable limit.

Retry state is tracked via the `x-retry-attempt` request header rather
than a WeakMap so that the counter survives across the new `Request`
objects created on each retry call.

## Implements

## Implements

- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new RetryInterceptor**(`config?`): `RetryInterceptor`

Defined in: packages/blue-http/src/interceptors/retry-interceptor.ts:64

Creates a new retry interceptor.

#### Parameters

##### config?

[`RetryInit`](../type-aliases/RetryInit.md) = `{}`

Retry configuration.  All fields are optional and
  default to the most conservative behaviour (zero retries).

#### Returns

`RetryInterceptor`

## Methods

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/interceptors/retry-interceptor.ts:81

Potentially retries the failed request according to the configured policy.

Returns `undefined` (letting the error propagate) when:
- `retryLimit` is 0 or unset
- The attempt ceiling has already been reached
- The response status is not in `retryStatusCodes` (when that list is non-empty)

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

#### Returns

`Promise`\<`Response`\>

A promise that resolves to the retried response, or `undefined`.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)
