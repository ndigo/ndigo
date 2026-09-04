[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / StatusInterceptor

# Class: StatusInterceptor

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:31

HTTP interceptor that normalizes HTTP status codes into consistent application-level status representations.

This interceptor adds a normalized status string to the response, which can be used by the
application to handle responses without relying on numeric HTTP codes.

## Implements

## Implements

- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new StatusInterceptor**(`config?`): `StatusInterceptor`

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:39

Creates a new status interceptor.

#### Parameters

##### config?

[`StatusInterceptorConfig`](../interfaces/StatusInterceptorConfig.md) = `{}`

Status interceptor configuration.

#### Returns

`StatusInterceptor`

## Methods

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void` \| `Response`\>

Defined in: packages/blue-http/src/interceptors/status-interceptor.ts:50

Normalizes the HTTP status code of the response.

#### Parameters

##### response

`Response`

The response to normalize.

##### settings

`any`

The request settings used for the call.

#### Returns

`Promise`\<`void` \| `Response`\>

The response.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)
