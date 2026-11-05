[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/response-class-interceptor](../README.md) / MappedResponseClassHTTPInterceptor

# Class: MappedResponseClassHTTPInterceptor

Dispatches response hooks based on the response status class.

## Implements

- [`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseClassHTTPInterceptor**(`interceptor`): `MappedResponseClassHTTPInterceptor`

Creates a response-class dispatcher.

#### Parameters

##### interceptor

[`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

The interceptor to wrap.

#### Returns

`MappedResponseClassHTTPInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

The wrapped interceptor that receives class-specific callbacks.

##### Returns

[`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Dispatches the response to the appropriate class-specific hook.

#### Parameters

##### response

`Response`

The response to classify.

##### settings

[`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md)

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

A promise that settles after the matching hook completes.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../../../http-types/interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
