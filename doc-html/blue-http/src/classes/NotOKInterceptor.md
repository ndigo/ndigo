[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / NotOKInterceptor

# Class: NotOKInterceptor

Defined in: [packages/blue-http/src/interceptors/not-ok-interceptor.ts:11](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/not-ok-interceptor.ts#lines-11)

Throws a [ResponseError](#) when the response status is outside 200-299.

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new NotOKInterceptor**(): `NotOKInterceptor`

#### Returns

`NotOKInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: [packages/blue-http/src/interceptors/not-ok-interceptor.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/interceptors/not-ok-interceptor.ts#lines-18)

#### Parameters

##### response

`Response`

The HTTP response

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The HTTP request settings

#### Returns

`Promise`\<`void` \| `Response`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
