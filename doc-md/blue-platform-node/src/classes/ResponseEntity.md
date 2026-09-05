[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-platform-node/src](../README.md) / ResponseEntity

# Class: ResponseEntity\<T\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:18](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-18)

A response with an explicit HTTP status, headers, and body.

## Type Parameters

### T

`T` = `unknown`

## Constructors

### Constructor

> **new ResponseEntity**\<`T`\>(`body`, `status`, `headers?`): `ResponseEntity`\<`T`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-37)

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

Defined in: [packages/blue-platform-node/src/response-entity.ts:22](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-22)

The response body.

***

### status

> `readonly` **status**: `ResponseStatus`

Defined in: [packages/blue-platform-node/src/response-entity.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-26)

The HTTP status.

***

### headers

> `readonly` **headers**: `Record`\<`string`, `string`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-30)

Response headers, keyed by header name.

## Methods

### ok()

> `static` **ok**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-44)

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

### created()

> `static` **created**\<`T`\>(`body`): `ResponseEntity`\<`T`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:49](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-49)

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

### noContent()

> `static` **noContent**(): `ResponseEntity`\<`void`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-54)

`204 No Content` response.

#### Returns

`ResponseEntity`\<`void`\>

***

### notFound()

> `static` **notFound**(): `ResponseEntity`\<`void`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:59](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-59)

`404 Not Found` response.

#### Returns

`ResponseEntity`\<`void`\>

***

### badRequest()

> `static` **badRequest**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:64](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-64)

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

### internalServerError()

> `static` **internalServerError**\<`T`\>(`body?`): `ResponseEntity`\<`T` \| `undefined`\>

Defined in: [packages/blue-platform-node/src/response-entity.ts:69](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-platform-node/src/response-entity.ts#lines-69)

`500 Internal Server Error` response.

#### Type Parameters

##### T

`T` = `unknown`

#### Parameters

##### body?

`T`

#### Returns

`ResponseEntity`\<`T` \| `undefined`\>
