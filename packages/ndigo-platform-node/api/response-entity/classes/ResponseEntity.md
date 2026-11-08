[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [response-entity](../README.md) / ResponseEntity

# Class: ResponseEntity\<T\>

A response with an explicit HTTP status, headers, and body.

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new ResponseEntity**\<`T`\>(`body`, `status`, `headers?`): `ResponseEntity`\<`T`\>

Creates a response entity.

#### Parameters

##### body

`T`

The response body.

##### status

`ResponseStatus`

The HTTP status.

##### headers?

`Record`\<`string`, `string`\> = `{}`

Response headers.

#### Returns

`ResponseEntity`\<`T`\>

## Properties

### body

> `readonly` **body**: `T`

The response body.

***

### headers

> `readonly` **headers**: `Record`\<`string`, `string`\>

Response headers, keyed by header name.

***

### status

> `readonly` **status**: `ResponseStatus`

The HTTP status.

## Methods

### badRequest()

> `static` **badRequest**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `400 Bad Request` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### created()

> `static` **created**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

Creates a `201 Created` response.

#### Type Parameters

##### T

`T`

#### Parameters

##### body

`T`

The response body.

#### Returns

`ResponseEntity`\<`T`\>

The response entity.

***

### forbidden()

> `static` **forbidden**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `403 Forbidden` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### internalServerError()

> `static` **internalServerError**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `500 Internal Server Error` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### methodNotAllowed()

> `static` **methodNotAllowed**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `405 Method Not Allowed` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### noContent()

> `static` **noContent**(): `ResponseEntity`\<`void`\>

Creates a `204 No Content` response.

#### Returns

`ResponseEntity`\<`void`\>

The response entity.

***

### notAcceptable()

> `static` **notAcceptable**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `406 Not Acceptable` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### notFound()

> `static` **notFound**(): `ResponseEntity`\<`void`\>

Creates a `404 Not Found` response.

#### Returns

`ResponseEntity`\<`void`\>

The response entity.

***

### ok()

> `static` **ok**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

Creates a `200 OK` response.

#### Type Parameters

##### T

`T`

#### Parameters

##### body

`T`

The response body.

#### Returns

`ResponseEntity`\<`T`\>

The response entity.

***

### serviceUnavailable()

> `static` **serviceUnavailable**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `503 Service Unavailable` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### tooManyRequests()

> `static` **tooManyRequests**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `429 Too Many Requests` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### unauthorized()

> `static` **unauthorized**\<`T`\>(`body?`, `headers?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `401 Unauthorized` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

##### headers?

`Record`\<`string`, `string`\> = `{}`

Response headers.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### unprocessableEntity()

> `static` **unprocessableEntity**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `422 Unprocessable Entity` response (schema validation failures).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.

***

### unsupportedMediaType()

> `static` **unsupportedMediaType**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Creates a `415 Unsupported Media Type` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

The optional response body.

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

The response entity.
