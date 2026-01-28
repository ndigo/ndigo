[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTP

# Class: HTTP

Defined in: packages/blue-http/src/http.ts:549



## Constructors

### Constructor

> **new HTTP**(`interceptors`, `init`, `fetch`): `HTTP`

Defined in: packages/blue-http/src/http.ts:564

#### Parameters

##### interceptors

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[] = `[]`

##### init

[`HTTPInit`](../type-aliases/HTTPInit.md) = `defaults`

##### fetch

`any` = `...`

#### Returns

`HTTP`

## Properties

### settings

> **settings**: [`HTTPInit`](../type-aliases/HTTPInit.md)

Defined in: packages/blue-http/src/http.ts:552

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-http/src/http.ts:554

##### Returns

`string`

***

### interceptors

#### Get Signature

> **get** **interceptors**(): [`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

Defined in: packages/blue-http/src/http.ts:560

##### Returns

[`HTTPInterceptor`](../type-aliases/HTTPInterceptor.md)[]

## Methods

### request()

> **request**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:580

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `null`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### connect()

> **connect**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:631

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### delete()

> **delete**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:643

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### get()

> **get**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:655

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### head()

> **head**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:667

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### options()

> **options**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:679

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### patch()

> **patch**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:691

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### post()

> **post**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:703

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### put()

> **put**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:715

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### trace()

> **trace**(`input`, `init?`): `Promise`\<`Response`\>

Defined in: packages/blue-http/src/http.ts:727

#### Parameters

##### input

`string`

##### init?

[`HTTPInit`](../type-aliases/HTTPInit.md) = `{}`

#### Returns

`Promise`\<`Response`\>

#### Async

*

***

### \_getHTTPExecutionChain()

> `protected` **\_getHTTPExecutionChain**(`http`, `url`): [`HTTPExecutionChain`](HTTPExecutionChain.md)

Defined in: packages/blue-http/src/http.ts:739

*

#### Parameters

##### http

`HTTP` | [`HTTPExecutionChain`](HTTPExecutionChain.md)

##### url

`string`

#### Returns

[`HTTPExecutionChain`](HTTPExecutionChain.md)
