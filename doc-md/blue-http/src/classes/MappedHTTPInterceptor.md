[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / MappedHTTPInterceptor

# Class: MappedHTTPInterceptor

Defined in: packages/blue-http/src/http.ts:240

## Implements

external:ResponseAwareHTTPInterceptor

## Implements

- [`CompletionAwareHTTPInterceptor`](../interfaces/CompletionAwareHTTPInterceptor.md)
- [`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md)
- [`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md)
- [`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md)
- [`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md)

## Constructors

### Constructor

> **new MappedHTTPInterceptor**(`interceptor`, `includePatterns`, `excludePatterns?`): `MappedHTTPInterceptor`

Defined in: packages/blue-http/src/http.ts:258

#### Parameters

##### interceptor

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

##### includePatterns

`string`[]

##### excludePatterns?

`string`[]

#### Returns

`MappedHTTPInterceptor`

## Properties

### urlMatcher

> **urlMatcher**: [`WildcardMatcher`](WildcardMatcher.md)

Defined in: packages/blue-http/src/http.ts:252

## Accessors

### interceptor

#### Get Signature

> **get** **interceptor**(): [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

Defined in: packages/blue-http/src/http.ts:254

##### Returns

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

## Methods

### matches()

> **matches**(`url`, `matcher?`): `boolean`

Defined in: packages/blue-http/src/http.ts:265

#### Parameters

##### url

`string`

##### matcher?

[`WildcardMatcher`](WildcardMatcher.md)

#### Returns

`boolean`

***

### postError()

> **postError**(`error`, `request`, `http`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:297

#### Parameters

##### error

`Error`

##### request

`Request`

##### http

[`HTTP`](HTTP.md)

#### Returns

`Promise`\<`Response`\>

#### Implementation of

[`ErrorAwareHTTPInterceptor`](../interfaces/ErrorAwareHTTPInterceptor.md).[`postError`](../interfaces/ErrorAwareHTTPInterceptor.md#posterror)

***

### postComplete()

> **postComplete**(`request`, `response`): `void`

Defined in: packages/blue-http/src/http.ts:304

#### Parameters

##### request

`Request`

##### response

`Response`

#### Returns

`void`

#### Implementation of

[`CompletionAwareHTTPInterceptor`](../interfaces/CompletionAwareHTTPInterceptor.md).[`postComplete`](../interfaces/CompletionAwareHTTPInterceptor.md#postcomplete)

***

### postResponse()

> **postResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/http.ts:311

#### Parameters

##### response

`Response`

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ResponseAwareHTTPInterceptor`](../interfaces/ResponseAwareHTTPInterceptor.md).[`postResponse`](../interfaces/ResponseAwareHTTPInterceptor.md#postresponse)

***

### preInit()

> **preInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/http.ts:318

#### Parameters

##### url

`URL`

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

#### Returns

`boolean`

#### Implementation of

[`InitializationAwareHTTPInterceptor`](../interfaces/InitializationAwareHTTPInterceptor.md).[`preInit`](../interfaces/InitializationAwareHTTPInterceptor.md#preinit)

***

### preRequest()

> **preRequest**(`request`, `http`): `Promise`\<`void` \| `Request`\>

Defined in: packages/blue-http/src/http.ts:326

#### Parameters

##### request

`Request`

##### http

[`HTTP`](HTTP.md)

#### Returns

`Promise`\<`void` \| `Request`\>

#### Implementation of

[`RequestAwareHTTPInterceptor`](../interfaces/RequestAwareHTTPInterceptor.md).[`preRequest`](../interfaces/RequestAwareHTTPInterceptor.md#prerequest)

***

### setExcludePatterns()

> **setExcludePatterns**(`excludePatterns`): `void`

Defined in: packages/blue-http/src/http.ts:334

#### Parameters

##### excludePatterns

`string`[] = `[]`

#### Returns

`void`

***

### setIncludePatterns()

> **setIncludePatterns**(`includePatterns`): `void`

Defined in: packages/blue-http/src/http.ts:338

#### Parameters

##### includePatterns

`string`[] = `[]`

#### Returns

`void`
