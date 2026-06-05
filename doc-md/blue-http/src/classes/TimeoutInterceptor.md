[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / TimeoutInterceptor

# Class: TimeoutInterceptor

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:33

Aborts slow requests and converts aborts into timeout responses.

## Implements

module:http.CompletionAwareHTTPInterceptor

## Implements

module:http.ErrorAwareHTTPInterceptor

## Implements

module:http.InitializationAwareHTTPInterceptor

## Implements

- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)\<[`TimeoutInit`](../type-aliases/TimeoutInit.md)\>
- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)
- [`CompletionAwareHTTPInterceptor`](../interfaces/CompletionAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new TimeoutInterceptor**(`timeout`): `TimeoutInterceptor`

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:43

#### Parameters

##### timeout

`number`

#### Returns

`TimeoutInterceptor`

## Properties

### timeout

> `readonly` **timeout**: `number`

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:41

## Methods

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:65

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

***

### postError()

> **postError**(`error`, `request`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:83

#### Parameters

##### error

`Error`

The error that was thrown

##### request

`Request`

The HTTP request

#### Returns

`Promise`\<`Response`\>

#### Async

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)

***

### postComplete()

> **postComplete**(`request`, `response`): `void`

Defined in: packages/blue-http/src/interceptors/timeout-interceptor.ts:94

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
