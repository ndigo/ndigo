[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-execution-chain](../README.md) / HTTPExecutionChain

# Class: HTTPExecutionChain

Ordered interceptor chain for one `HTTP` client: tracks which interceptor
capabilities are registered (completion/error/initialization/request/response
aware) so the chain can skip work it has no interceptor for, and runs the
hooks in registration order around each request.

## Constructors

### Constructor

> **new HTTPExecutionChain**(`http`, `interceptors?`): `HTTPExecutionChain`

Creates a chain for the given HTTP client and optional interceptor list.

#### Parameters

##### http

[`HTTP`](../../http-client/classes/HTTP.md) \| `HTTPExecutionChain`

The owning HTTP client or an existing execution chain.

##### interceptors?

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[] \| `null` = `null`

Interceptors to seed the chain with.

#### Returns

`HTTPExecutionChain`

## Properties

### http

> **http**: [`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client that owns this execution chain.

***

### interceptorIndex

> **interceptorIndex**: `number`

The index of the most recent initialization-aware interceptor.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[]

The interceptors registered with this execution chain.

##### Returns

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[]

## Methods

### \_checkInterceptorType()

> **\_checkInterceptorType**(`interceptor`): `void`

Checks one interceptor's shape and updates the chain's capability flags.

#### Parameters

##### interceptor

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)

The interceptor to check.

#### Returns

`void`

***

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Adds a single interceptor to the chain.

#### Parameters

##### interceptor

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)

The interceptor to append.

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Adds multiple interceptors to the chain in order.

#### Parameters

##### interceptors

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)[]

Interceptors to append.

#### Returns

`void`

***

### applyPostComplete()

> **applyPostComplete**(`request`, `response`, `settings?`): `void`

Runs all completion-aware interceptors after the request settles.

#### Parameters

##### request

`Request`

The request that completed.

##### response

`Response` \| [`ResponseError`](../../response-error/classes/ResponseError.md)

The final response or error wrapper.

##### settings?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The request settings the request was prepared from, when available.

#### Returns

`void`

***

### applyPostError()

> **applyPostError**(`error`, `request`, `http`, `settings?`): `Promise`\<`Response` \| `undefined`\>

Runs the error-aware interceptors in order, accumulating a recovery.

Interceptors that return `undefined` (they do not handle the error) let
later interceptors run. An interceptor that returns a response recovers
the request — and that recovery becomes the error context handed to the
remaining interceptors (as a [ResponseError](../../response-error/classes/ResponseError.md)), so a chain like
`[Timeout, Retry]` can retry a timeout produced by an earlier
interceptor, while `[Retry, Timeout]` still translates an abort into a
408. Interceptors that decline leave the most recent recovery in place.

#### Parameters

##### error

`Error`

The request failure.

##### request

`Request`

The request that failed.

##### http

[`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client executing the request.

##### settings?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The per-request settings object, threaded so error-aware
interceptors can key state on an identity that survives request
replacement.

#### Returns

`Promise`\<`Response` \| `undefined`\>

The most recent replacement response, or `undefined` when no interceptor handles the error.

***

### applyPostResponse()

> **applyPostResponse**(`response`, `settings`, `request?`): `Promise`\<`Response`\>

Runs response-aware interceptors and returns the final response.

#### Parameters

##### response

`Response`

The response returned by fetch.

##### settings

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The request settings used for the call.

##### request?

`Request`

The final request that was sent, when available.

#### Returns

`Promise`\<`Response`\>

The transformed response, or the original response when no transformer applies.

***

### applyPreInit()

> **applyPreInit**(`url`, `settings`): `boolean`

Runs initialization-aware interceptors before the request object is created.

#### Parameters

##### url

`URL`

The resolved request URL.

##### settings

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The request settings being prepared.

#### Returns

`boolean`

`false` when an interceptor cancels the request.

***

### applyPreRequest()

> **applyPreRequest**(`request`, `http`, `settings?`): `Promise`\<`Request` \| `Response`\>

Runs request-aware interceptors before fetch executes.

#### Parameters

##### request

`Request`

The request to inspect or replace.

##### http

[`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client executing the request.

##### settings?

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The per-request settings object, threaded to
request-aware interceptors that must key state on an identity surviving
request replacement.

#### Returns

`Promise`\<`Request` \| `Response`\>

The transformed request, or the original request when unsupported.
