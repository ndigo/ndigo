[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ErrorNormalizationInterceptor

# Class: ErrorNormalizationInterceptor

Defined in: [packages/blue-http/src/interceptors/error-normalization-interceptor.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/error-normalization-interceptor.ts#lines-28)

HTTP interceptor that standardizes error responses into a consistent shape.

This interceptor ensures that both network-level failures and HTTP error
responses are normalized into a consistent format for the application.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)
- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new ErrorNormalizationInterceptor**(`config?`): `ErrorNormalizationInterceptor`

Defined in: [packages/blue-http/src/interceptors/error-normalization-interceptor.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/error-normalization-interceptor.ts#lines-36)

Creates a new error normalization interceptor.

#### Parameters

##### config?

[`ErrorNormalizationInterceptorConfig`](../interfaces/ErrorNormalizationInterceptorConfig.md) = `{}`

Error normalization configuration.

#### Returns

`ErrorNormalizationInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-http/src/interceptors/error-normalization-interceptor.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/error-normalization-interceptor.ts#lines-47)

Normalizes HTTP error responses (status codes outside 200-299).

#### Parameters

##### response

`Response`

The response to normalize.

##### settings

`any`

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

A normalized response or void.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response` \| `undefined`\>

Defined in: [packages/blue-http/src/interceptors/error-normalization-interceptor.ts:65](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/error-normalization-interceptor.ts#lines-65)

Normalizes transport or network errors.

#### Parameters

##### error

`Error`

The failure that interrupted request execution.

##### request

`Request`

The request that failed.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`Response` \| `undefined`\>

A normalized response or undefined.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)
