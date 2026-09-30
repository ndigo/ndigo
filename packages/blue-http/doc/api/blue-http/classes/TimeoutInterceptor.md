[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / TimeoutInterceptor

# Class: TimeoutInterceptor

Aborts slow requests and converts aborts into timeout responses.

Each request gets its own timer keyed by its `AbortSignal`, so one
request settling (success or failure) never clears another request's
pending timeout. Only `AbortError` failures are translated into 408
responses — transport failures (DNS, TLS, CORS, TypeError) fall through
to other error-aware interceptors or propagate to the caller.

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`TimeoutInit`](../type-aliases/TimeoutInit.md)\>
- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)
- [`CompletionAwareHTTPInterceptor`](../interfaces/CompletionAwareHTTPInterceptor.md)

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

> **postComplete**(`request`, `response`): `void`

#### Parameters

##### request

`Request`

The HTTP request

##### response

`Response`

The HTTP response

#### Returns

`void`

#### Implementation of

[`CompletionAwareHTTPInterceptor`](../interfaces/CompletionAwareHTTPInterceptor.md).[`postComplete`](../interfaces/CompletionAwareHTTPInterceptor.md#postcomplete)

***

### postError()

> **postError**(`error`, `request`): `Promise`\<`Response` \| `undefined`\>

#### Parameters

##### error

`Error`

The error that was thrown

##### request

`Request`

The HTTP request

#### Returns

`Promise`\<`Response` \| `undefined`\>

A 408 response for
  aborted requests, or `undefined` so other error-aware interceptors
  can handle transport failures.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)

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

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)
