[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / MappedResponseCodeHTTPInterceptor

# Class: MappedResponseCodeHTTPInterceptor

Defined in: [packages/blue-http/src/interceptors/response-code-interceptor.ts:25](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-code-interceptor.ts#lines-25)

Dispatches response hooks based on the numeric status code.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseCodeHTTPInterceptor**(`interceptor`): `MappedResponseCodeHTTPInterceptor`

Defined in: [packages/blue-http/src/interceptors/response-code-interceptor.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-code-interceptor.ts#lines-40)

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

Defined in: [packages/blue-http/src/interceptors/response-code-interceptor.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-code-interceptor.ts#lines-31)

The wrapped interceptor map.

##### Returns

[`ResponseCodeAwareHTTPInterceptor`](../interfaces/ResponseCodeAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-http/src/interceptors/response-code-interceptor.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-code-interceptor.ts#lines-51)

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
