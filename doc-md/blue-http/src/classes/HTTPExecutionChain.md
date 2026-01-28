[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPExecutionChain

# Class: HTTPExecutionChain

Defined in: packages/blue-http/src/http.ts:347

## Constructors

### Constructor

> **new HTTPExecutionChain**(`http`, `interceptors`): `HTTPExecutionChain`

Defined in: packages/blue-http/src/http.ts:374

#### Parameters

##### http

[`HTTP`](HTTP.md) | `HTTPExecutionChain`

##### interceptors

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[] = `null`

#### Returns

`HTTPExecutionChain`

## Properties

### http

> **http**: [`HTTP`](HTTP.md)

Defined in: packages/blue-http/src/http.ts:358

***

### interceptorIndex

> **interceptorIndex**: `number`

Defined in: packages/blue-http/src/http.ts:362

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-http/src/http.ts:364

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: packages/blue-http/src/http.ts:370

##### Returns

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

## Methods

### addInterceptor()

> **addInterceptor**(`interceptor`): `void`

Defined in: packages/blue-http/src/http.ts:398

#### Parameters

##### interceptor

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

#### Returns

`void`

***

### addInterceptors()

> **addInterceptors**(`interceptors`): `void`

Defined in: packages/blue-http/src/http.ts:411

#### Parameters

##### interceptors

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

#### Returns

`void`

***

### applyPostError()

> **applyPostError**(`error`, `request`, `http`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:422

#### Parameters

##### error

`Error`

##### request

`Request`

##### http

[`HTTP`](HTTP.md)

#### Returns

`Promise`\<`Response`\>

***

### applyPostComplete()

> **applyPostComplete**(`request`, `response`): `void`

Defined in: packages/blue-http/src/http.ts:440

#### Parameters

##### request

`Request`

##### response

`Response`

#### Returns

`void`

***

### applyPostResponse()

> **applyPostResponse**(`response`, `settings`): `Promise`\<`void`\>

Defined in: packages/blue-http/src/http.ts:458

#### Parameters

##### response

`Response`

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

#### Returns

`Promise`\<`void`\>

***

### applyPreInit()

> **applyPreInit**(`url`, `settings`): `boolean`

Defined in: packages/blue-http/src/http.ts:476

#### Parameters

##### url

`URL`

##### settings

[`HTTPInit`](../type-aliases/HTTPInit.md)

#### Returns

`boolean`

***

### applyPreRequest()

> **applyPreRequest**(`request`, `http`): `Promise`\<`Request`\>

Defined in: packages/blue-http/src/http.ts:498

#### Parameters

##### request

`Request`

##### http

[`HTTP`](HTTP.md)

#### Returns

`Promise`\<`Request`\>

***

### \_checkInterceptorType()

> `protected` **\_checkInterceptorType**(`interceptor`): `void`

Defined in: packages/blue-http/src/http.ts:524

*

#### Parameters

##### interceptor

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)

#### Returns

`void`
