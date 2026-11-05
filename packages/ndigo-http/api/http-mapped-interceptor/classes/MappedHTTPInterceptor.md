[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [http-mapped-interceptor](../README.md) / MappedHTTPInterceptor

# Class: MappedHTTPInterceptor

Runs after a request finishes, whether it succeeded or failed.

## Implements

- [`CompletionAwareHTTPInterceptor`](../../http-types/interfaces/CompletionAwareHTTPInterceptor.md)
- [`ErrorAwareHTTPInterceptor`](../../http-types/interfaces/ErrorAwareHTTPInterceptor.md)
- [`InitializationAwareHTTPInterceptor`](../../http-types/interfaces/InitializationAwareHTTPInterceptor.md)
- [`RequestAwareHTTPInterceptor`](../../http-types/interfaces/RequestAwareHTTPInterceptor.md)
- [`ResponseAwareHTTPInterceptor`](../../http-types/interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedHTTPInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedHTTPInterceptor`

Creates a URL-scoped interceptor wrapper.

#### Parameters

##### interceptor

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)

The interceptor to delegate to when a pattern matches.

##### includePatterns

`string`[]

URL patterns that enable the interceptor.

##### excludePatterns?

`string`[]

URL patterns that disable the interceptor.

#### Returns

`MappedHTTPInterceptor`

## Properties

### urlMatcher

> **urlMatcher**: [`WildcardMatcher`](WildcardMatcher.md)

URL matcher used to evaluate include/exclude patterns.

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)

The wrapped interceptor that will run when the URL matches.

##### Returns

[`HTTPInterceptor`](../../http-types/type-aliases/HTTPInterceptor.md)

## Methods

### matches()

> **matches**(`url`, `matcher?`): `boolean`

Tests whether the supplied URL is included and not excluded.

#### Parameters

##### url

`string`

The URL to evaluate.

##### matcher?

[`WildcardMatcher`](WildcardMatcher.md)

Optional matcher to reuse for pattern checks.

#### Returns

`boolean`

`true` when the URL should receive the wrapped interceptor.

***

### postComplete()

> **postComplete**(`request`, `response`, `settings?`): `void`

Delegates completion handling to the wrapped interceptor when supported.

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

#### Implementation of

[`CompletionAwareHTTPInterceptor`](../../http-types/interfaces/CompletionAwareHTTPInterceptor.md).[`postComplete`](../../http-types/interfaces/CompletionAwareHTTPInterceptor.md#postcomplete)

***

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response` \| `undefined`\>

Delegates post-error handling to the wrapped interceptor when supported.

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

#### Returns

`Promise`\<`Response` \| `undefined`\>

A replacement response, or `undefined` if the interceptor does not handle errors.

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../../http-types/interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../../http-types/interfaces/ErrorAwareHTTPInterceptor.md#posterror)

***

### postResponse()

> **postResponse**(`response`, `settings`, `request?`): `Promise`\<`void` \| `Response`\>

Delegates response handling to the wrapped interceptor when supported.

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

`Promise`\<`void` \| `Response`\>

A replacement response, or `void` to keep the original.

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../../http-types/interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../../http-types/interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Delegates initialization handling to the wrapped interceptor when supported.

#### Parameters

##### url

`URL`

The resolved request URL.

##### settings

[`HTTPInit`](../../http-types/type-aliases/HTTPInit.md)

The request settings being prepared.

#### Returns

`boolean`

`false` when the wrapped interceptor rejects the request.

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../../http-types/interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../../http-types/interfaces/InitializationAwareHTTPInterceptor.md#preinit)

***

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Request` \| `Response`\>

Delegates request handling to the wrapped interceptor when supported.

#### Parameters

##### request

`Request`

The request to inspect or replace.

##### http

[`HTTP`](../../http-client/classes/HTTP.md)

The HTTP client executing the request.

#### Returns

`Promise`\<`void` \| `Request` \| `Response`\>

A replacement request, or the original request when unsupported.

#### Implementation of

[`RequestAwareHTTPInterceptor`](../../http-types/interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../../http-types/interfaces/RequestAwareHTTPInterceptor.md#prerequest)

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns?`): `void`

Replaces the patterns that block the wrapped interceptor.

#### Parameters

##### excludePatterns?

`string`[] = `[]`

URL patterns that disable the interceptor.

#### Returns

`void`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns?`): `void`

Replaces the patterns that enable the wrapped interceptor.

#### Parameters

##### includePatterns?

`string`[] = `[]`

URL patterns that enable the interceptor.

#### Returns

`void`
