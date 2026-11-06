[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/timeout-interceptor](../README.md) / TimeoutInterceptor

# Class: TimeoutInterceptor

Aborts slow requests and converts aborts into timeout responses.

Each request gets its own timer, tracked against that request's settings so
settling one request never clears another request's pending timeout and no
timer outlives the request it belongs to. A caller-supplied `AbortSignal` is
composed with the timeout signal: caller aborts propagate as cancels, while
only this interceptor's own timer yields a 408. Transport failures (DNS,
TLS, CORS, TypeError) fall through to other error-aware interceptors or
propagate to the caller.

## Implements

- [`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md)\<[`TimeoutInit`](../type-aliases/TimeoutInit.md)\>
- [`ErrorAwareHTTPInterceptor`](../../../http-types/interfaces/ErrorAwareHTTPInterceptor.md)
- [`CompletionAwareHTTPInterceptor`](../../../http-types/interfaces/CompletionAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new TimeoutInterceptor**(`timeout`): `TimeoutInterceptor`

#### Parameters

##### timeout

`number`

#### Returns

`TimeoutInterceptor`

## Properties

### timeout

> `readonly` **timeout**: `number`

## Methods

### postComplete()

> **postComplete**(`request`, `response`, `settings?`): `void`

#### Parameters

##### request

`Request`

The HTTP request

##### response

`Response`

The HTTP response

##### settings?

[`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md)

The settings the request was prepared from

#### Returns

`void`

#### Implementation of

[`CompletionAwareHTTPInterceptor`](../../../http-types/interfaces/CompletionAwareHTTPInterceptor.md).[`postComplete`](../../../http-types/interfaces/CompletionAwareHTTPInterceptor.md#postcomplete)

***

### postError()

> **postError**(`error`, `request`, `http`, `settings?`): `Promise`\<`Response` \| `undefined`\>

#### Parameters

##### error

`Error`

The error that was thrown

##### request

`Request`

The HTTP request

##### http

[`HTTP`](../../../http-client/classes/HTTP.md)

The HTTP client executing the request

##### settings?

[`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md)

The per-request settings, used to release the timer on the
  error exit path (which never reaches `postComplete` when a later
  error-aware interceptor throws).

#### Returns

`Promise`\<`Response` \| `undefined`\>

A 408 response for
  timed-out requests, or `undefined` so other error-aware interceptors
  (and finally the caller) can handle cancels and transport failures.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../../../http-types/interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../../../http-types/interfaces/ErrorAwareHTTPInterceptor.md#posterror)

***

### preInit()

> **preInit**(`url`, `settings`): `boolean`

#### Parameters

##### url

`URL`

The requested URL.

##### settings

[`TimeoutInit`](../type-aliases/TimeoutInit.md)

The HTTP request settings, including the `timeout` setting.

#### Returns

`boolean`

Whether or not the http request should continue execution.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../../../http-types/interfaces/InitializationAwareHTTPInterceptor.md#preinit)
