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

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/body)

#### Implementation of

`Response.body`

***

### bodyUsed

> **bodyUsed**: `boolean`

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Request/bodyUsed)

#### Implementation of

`Response.bodyUsed`

***

### headers

> **headers**: `Headers`

The **`headers`** read-only property of the Response interface contains the Headers object associated with the response.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/headers)

#### Implementation of

`Response.headers`

***

### message

> **message**: `string`

#### Implementation of

`Error.message`

#### Overrides

`FrameworkError.message`

***

### name

> **name**: `string`

#### Implementation of

`Error.name`

#### Overrides

`FrameworkError.name`

***

### ok

> **ok**: `boolean`

The **`ok`** read-only property of the Response interface contains a Boolean stating whether the response was successful (status in the range 200-299) or not.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/ok)

#### Implementation of

`Response.ok`

***

### redirected

> **redirected**: `boolean`

The **`redirected`** read-only property of the Response interface indicates whether or not the response is the result of a request you made which was redirected.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/redirected)

#### Implementation of

`Response.redirected`

***

### stack?

> `optional` **stack?**: `string`

#### Implementation of

`Error.stack`

#### Overrides

`FrameworkError.stack`

***

### status

> **status**: `number`

The **`status`** read-only property of the Response interface contains the HTTP status codes of the response.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/status)

#### Implementation of

`Response.status`

***

### statusText

> **statusText**: `string`

The **`statusText`** read-only property of the Response interface contains the status message corresponding to the HTTP status code in Response.status.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/statusText)

#### Implementation of

`Response.statusText`

***

### type

> **type**: `ResponseType`

The **`type`** read-only property of the Response interface contains the type of the response. The type determines whether scripts are able to access the response body and headers.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/type)

#### Implementation of

`Response.type`

***

### url

> **url**: `string`

The **`url`** read-only property of the Response interface contains the URL of the response. The value of the url property will be the final URL obtained after any redirects.

[MDN Reference](https://developer.mozilla.org/docs/Web/API/Response/url)

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

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`
