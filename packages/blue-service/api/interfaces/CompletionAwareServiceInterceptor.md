[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / CompletionAwareServiceInterceptor

# Interface: CompletionAwareServiceInterceptor

Service-level completion interceptor.

Reuses the [CompletionAwareHTTPInterceptor](#) interface; `postRequest`
is the service-level "request completed" hook (HTTP's `postComplete`).

## Extends

- [`CompletionAwareHTTPInterceptor`](#)

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

`HTTPInit`

The request settings the request was prepared from.
The execution chain always supplies it; callers that invoke the hook
directly may omit it.

#### Returns

`void`

#### Inherited from

`CompletionAwareHTTPInterceptor.postComplete`

***

### postRequest()

> **postRequest**(`request`): `void`

Runs after the request has completed successfully.

#### Parameters

##### request

`Request`

The request that just completed.

#### Returns

`void`
