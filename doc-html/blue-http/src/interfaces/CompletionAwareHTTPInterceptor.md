[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / CompletionAwareHTTPInterceptor

# Interface: CompletionAwareHTTPInterceptor

Defined in: [packages/blue-http/src/http.ts:80](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-80)

Runs after a request finishes, whether it succeeded or failed.

## Methods

### postComplete()

> **postComplete**(`request`, `response`): `void`

Defined in: [packages/blue-http/src/http.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-87)

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
