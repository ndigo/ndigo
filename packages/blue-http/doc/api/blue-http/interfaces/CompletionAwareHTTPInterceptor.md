[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / CompletionAwareHTTPInterceptor

# Interface: CompletionAwareHTTPInterceptor

Runs after a request finishes, whether it succeeded or failed.

## Methods

### postComplete()

> **postComplete**(`request`, `response`): `void`

Observes the final request/response pair after all other hooks complete.

#### Parameters

##### request

`Request`

The original request.

##### response

`Response` \| [`ResponseError`](#)

The final response or error wrapper.

#### Returns

`void`
