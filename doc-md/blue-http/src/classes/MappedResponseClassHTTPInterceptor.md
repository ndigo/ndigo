[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / MappedResponseClassHTTPInterceptor

# Class: MappedResponseClassHTTPInterceptor

Defined in: [packages/blue-http/src/interceptors/response-class-interceptor.ts:113](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-class-interceptor.ts#lines-113)

Dispatches response hooks based on the response status class.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedResponseClassHTTPInterceptor**(`interceptor`): `MappedResponseClassHTTPInterceptor`

Defined in: [packages/blue-http/src/interceptors/response-class-interceptor.ts:133](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-class-interceptor.ts#lines-133)

Creates a response-class dispatcher.

#### Parameters

##### interceptor

`any`

The interceptor to wrap.

#### Returns

`MappedResponseClassHTTPInterceptor`

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

Defined in: [packages/blue-http/src/interceptors/response-class-interceptor.ts:124](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-class-interceptor.ts#lines-124)

The wrapped interceptor that receives class-specific callbacks.

##### Returns

[`ResponseClassAwareHTTPInterceptor`](../type-aliases/ResponseClassAwareHTTPInterceptor.md)

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-http/src/interceptors/response-class-interceptor.ts:149](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/response-class-interceptor.ts#lines-149)

Dispatches the response to the appropriate class-specific hook.

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
