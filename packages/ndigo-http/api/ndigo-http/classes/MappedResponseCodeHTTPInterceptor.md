[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / MappedResponseCodeHTTPInterceptor

# Class: MappedResponseCodeHTTPInterceptor

Dispatches response hooks based on the numeric status code.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseCodeHTTPInterceptor**(`interceptor`): `MappedResponseCodeHTTPInterceptor`

Creates a response-code dispatcher.

#### Parameters

##### interceptor

[`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

The interceptor map to wrap.

#### Returns

`MappedResponseCodeHTTPInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

The wrapped interceptor map.

##### Returns

[`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Dispatches the response to a matching status-code hook.

#### Parameters

##### response

`Response`

The response to classify.

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

A promise that settles after the matching hook completes.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
