[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / ResponseEntity

# Class: ResponseEntity\<T\>

A response with an explicit HTTP status, headers, and body.

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new ResponseEntity**\<`T`\>(`body`, `status`, `headers?`): `ResponseEntity`\<`T`\>

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

`400 Bad Request` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### created()

> `static` **created**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

`201 Created` response.

#### Type Parameters

##### T

`T`

#### Parameters

##### body

`T`

#### Returns

`ResponseEntity`\<`T`\>

***

### forbidden()

> `static` **forbidden**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`403 Forbidden` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### internalServerError()

> `static` **internalServerError**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`500 Internal Server Error` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### methodNotAllowed()

> `static` **methodNotAllowed**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`405 Method Not Allowed` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### noContent()

> `static` **noContent**(): `ResponseEntity`\<`void`\>

`204 No Content` response.

#### Returns

`ResponseEntity`\<`void`\>

***

### notAcceptable()

> `static` **notAcceptable**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`406 Not Acceptable` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### notFound()

> `static` **notFound**(): `ResponseEntity`\<`void`\>

`404 Not Found` response.

#### Returns

`ResponseEntity`\<`void`\>

***

### ok()

> `static` **ok**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

`200 OK` response.

#### Type Parameters

##### T

`T`

#### Parameters

##### body

`T`

#### Returns

`ResponseEntity`\<`T`\>

***

### serviceUnavailable()

> `static` **serviceUnavailable**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`503 Service Unavailable` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### tooManyRequests()

> `static` **tooManyRequests**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`429 Too Many Requests` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### unauthorized()

> `static` **unauthorized**\<`T`\>(`body?`, `headers?`): `ResponseEntity`\<`T` \| `undefined`\>

`401 Unauthorized` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

##### headers?

`Record`\<`string`, `string`\> = `{}`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### unprocessableEntity()

> `static` **unprocessableEntity**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`422 Unprocessable Entity` response (schema validation failures).

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>

***

### unsupportedMediaType()

> `static` **unsupportedMediaType**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

`415 Unsupported Media Type` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>
