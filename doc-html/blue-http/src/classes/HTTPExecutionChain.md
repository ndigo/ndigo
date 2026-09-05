[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPExecutionChain

# Class: HTTPExecutionChain

Defined in: [packages/blue-http/src/http.ts:559](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-559)

Executes registered interceptors in lifecycle order for a single request.

## Constructors

### Constructor

> **new HTTPExecutionChain**(`http`, `interceptors?`): `HTTPExecutionChain`

Defined in: [packages/blue-http/src/http.ts:595](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-595)

Creates a chain for the given HTTP client and optional interceptor list.

#### Parameters

##### http

[`HTTP`](HTTP.md) \| `HTTPExecutionChain`

The owning HTTP client or an existing execution chain.

##### interceptors?

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[] \| `null`

Interceptors to seed the chain with.

#### Returns

`HTTPExecutionChain`

## Properties

### http

> **http**: [`HTTP`](HTTP.md)

Defined in: [packages/blue-http/src/http.ts:571](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-571)

The HTTP client that owns this execution chain.

***

### interceptorIndex

> **interceptorIndex**: `number`

Defined in: [packages/blue-http/src/http.ts:576](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-576)

The index of the most recent initialization-aware interceptor.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-http/src/http.ts:578](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-578)

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: [packages/blue-http/src/http.ts:585](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-585)

The interceptors registered with this execution chain.

##### Returns

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: [packages/blue-http/src/http.ts:625](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-625)

Adds a single interceptor to the chain.

#### Parameters

##### interceptor

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

The interceptor to append.

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Defined in: [packages/blue-http/src/http.ts:640](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-640)

Adds multiple interceptors to the chain in order.

#### Parameters

##### interceptors

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Interceptors to append.

#### Returns

`void`

***

### applyPostError()

> **applyPostError**(`error`, `request`, `http`): `Promise`\<`Response` \| `undefined`\>

Defined in: [packages/blue-http/src/http.ts:657](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-657)

Runs the first error-aware interceptor that can recover from a failure.

#### Parameters

##### error

`Error`

The request failure.

##### request

`Request`

The request that failed.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`Response` \| `undefined`\>

A replacement response, or `undefined` when no interceptor handles the error.

***

### applyPostComplete()

> **applyPostComplete**(`request`, `response`): `void`

Defined in: [packages/blue-http/src/http.ts:681](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-681)

Runs all completion-aware interceptors after the request settles.

#### Parameters

##### request

`Request`

The request that completed.

##### response

`Response` \| [`ResponseError`](#)

The final response or error wrapper.

#### Returns

`void`

***

### applyPostResponse()

> **applyPostResponse**(`response`, `settings`): `Promise`\<`Response`\>

Defined in: [packages/blue-http/src/http.ts:704](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-704)

Runs response-aware interceptors and returns the final response.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The request settings used for the call.

#### Returns

`Promise`\<`Response`\>

The transformed response, or the original response when no transformer applies.

***

### applyPreInit()

> **applyPreInit**(`url`, `settings`): `boolean`

Defined in: [packages/blue-http/src/http.ts:737](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-737)

Runs initialization-aware interceptors before the request object is created.

#### Parameters

##### url

`URL`

The resolved request URL.

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

The request settings being prepared.

#### Returns

`boolean`

`false` when an interceptor cancels the request.

***

### applyPreRequest()

> **applyPreRequest**(`request`, `http`): `Promise`\<`Response` \| `Request`\>

Defined in: [packages/blue-http/src/http.ts:764](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-764)

Runs request-aware interceptors before fetch executes.

#### Parameters

##### request

`Request`

The request to inspect or replace.

##### http

[`HTTP`](HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`Response` \| `Request`\>

The transformed request, or the original request when unsupported.

***

### \_checkInterceptorType()

> `protected` **\_checkInterceptorType**(`interceptor`): `void`

Defined in: [packages/blue-http/src/http.ts:797](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http.ts#lines-797)

#### Parameters

##### interceptor

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

#### Returns

`void`
