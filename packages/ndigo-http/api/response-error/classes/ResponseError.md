[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [response-error](../README.md) / ResponseError

# Class: ResponseError

Error wrapper that also exposes the `Response` interface.

It preserves the original response when possible so callers can inspect the
failed payload without losing fetch semantics.

## Extends

- [`FrameworkError`](#)

## Implements

- `Error`
- `Response`

## Constructors

### Constructor

> **new ResponseError**(`response?`, `message?`): `ResponseError`

Wraps a response with a message or error.

#### Parameters

##### response?

`Response`

The response to expose.

##### message?

`string`

The error message to use.

#### Returns

`ResponseError`

#### Overrides

`FrameworkError.constructor`

### Constructor

> **new ResponseError**(`response?`, `error?`): `ResponseError`

Wraps a response with a message or error.

#### Parameters

##### response?

`Response`

The response to expose.

##### error?

`Error`

The original error.

#### Returns

`ResponseError`

#### Overrides

`FrameworkError.constructor`

## Properties

### body

> **body**: `ReadableStream`\<`Uint8Array`\<`ArrayBuffer`\>\>

The response body stream.

#### Implementation of

`Response.body`

***

### bodyUsed

> **bodyUsed**: `boolean`

Whether the body has been read.

#### Implementation of

`Response.bodyUsed`

***

### headers

> **headers**: `Headers`

The response headers.

#### Implementation of

`Response.headers`

***

### message

> **message**: `string`

The error message.

#### Implementation of

`Error.message`

#### Overrides

`FrameworkError.message`

***

### name

> **name**: `string`

The error name.

#### Implementation of

`Error.name`

#### Overrides

`FrameworkError.name`

***

### ok

> **ok**: `boolean`

Whether the response was successful.

#### Implementation of

`Response.ok`

***

### redirected

> **redirected**: `boolean`

Whether the response was redirected.

#### Implementation of

`Response.redirected`

***

### stack?

> `optional` **stack?**: `string`

The error stack.

#### Implementation of

`Error.stack`

#### Overrides

`FrameworkError.stack`

***

### status

> **status**: `number`

The HTTP status code.

#### Implementation of

`Response.status`

***

### statusText

> **statusText**: `string`

The HTTP status text.

#### Implementation of

`Response.statusText`

***

### type

> **type**: `ResponseType`

The response type.

#### Implementation of

`Response.type`

***

### url

> **url**: `string`

The response URL.

#### Implementation of

`Response.url`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### arrayBuffer()

> **arrayBuffer**(): `Promise`\<`ArrayBuffer`\>

Reads the wrapped response as an `ArrayBuffer`.

#### Returns

`Promise`\<`ArrayBuffer`\>

A promise for the response bytes.

#### Implementation of

`Response.arrayBuffer`

***

### blob()

> **blob**(): `Promise`\<`Blob`\>

Reads the wrapped response as a `Blob`.

#### Returns

`Promise`\<`Blob`\>

A promise for the response blob.

#### Implementation of

`Response.blob`

***

### bytes()

> **bytes**(): `Promise`\<`Uint8Array`\<`ArrayBuffer`\>\>

Reads the wrapped response as bytes.

#### Returns

`Promise`\<`Uint8Array`\<`ArrayBuffer`\>\>

A promise for the response bytes.

#### Implementation of

`Response.bytes`

***

### clone()

> **clone**(): `Response`

Creates a copy of the wrapped response error.

#### Returns

`Response`

A cloned `ResponseError`.

#### Implementation of

`Response.clone`

***

### formData()

> **formData**(): `Promise`\<`FormData`\>

Reads the wrapped response as `FormData`.

#### Returns

`Promise`\<`FormData`\>

A promise for the response form data.

#### Implementation of

`Response.formData`

***

### json()

> **json**(): `Promise`\<`unknown`\>

Reads the wrapped response as JSON.

#### Returns

`Promise`\<`unknown`\>

A promise for the parsed JSON value.

#### Implementation of

`Response.json`

***

### text()

> **text**(): `Promise`\<`string`\>

Reads the wrapped response as text.

#### Returns

`Promise`\<`string`\>

A promise for the response text.

#### Implementation of

`Response.text`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Returns a JSON-safe representation of the value.

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of the value.

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
