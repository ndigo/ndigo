[**@ndigo/http v0.0.1**](../../../README.md)

***

[@ndigo/http](../../../README.md) / [interceptors/response-class-interceptor](../README.md) / ServerErrorAwareHTTPInterceptor

# Interface: ServerErrorAwareHTTPInterceptor

Handles server error responses.

## Methods

### postServerErrorResponse()

> **postServerErrorResponse**(`response`, `settings`): `Promise`\<`void` \| `JSONObject`\>

Handles server error responses.

#### Parameters

##### response

`Response`

The response.

##### settings

[`HTTPInit`](../../../http-types/type-aliases/HTTPInit.md)

The request settings.

#### Returns

`Promise`\<`void` \| `JSONObject`\>

Optional model data.
