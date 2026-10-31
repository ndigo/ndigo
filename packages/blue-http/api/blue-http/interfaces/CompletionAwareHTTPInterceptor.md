[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / CompletionAwareHTTPInterceptor

# Interface: CompletionAwareHTTPInterceptor

Runs after a request finishes, whether it succeeded or failed.

## Methods

### postComplete()

> **postComplete**(`request`, `response`, `settings?`): `void`

Observes the final request/response pair after all other hooks complete.

#### Parameters

##### request

`Request`

The original request.

##### response

`Response` \| [`ResponseError`](#)

The final response or error wrapper.

##### settings?

[`HTTPInit`](../type-aliases/HTTPInit.md)

The request settings the request was prepared from.
The execution chain always supplies it; callers that invoke the hook
directly may omit it.

#### Returns

`void`
