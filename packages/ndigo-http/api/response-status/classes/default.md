[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [response-status](../README.md) / default

# Class: default

Represents an HTTP response status code and reason phrase.

Instances are cached by code so repeated lookups return the same object when
possible.

## See

[https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes](https://www.rfc-editor.org/rfc/rfc9110.html#name-status-codes)

## Implements

- `Comparable`\<`ResponseStatus`\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new default**(`code`, `text`): `ResponseStatus`

Creates a new response status.

#### Parameters

##### code

`number`

The numeric HTTP status code.

##### text

`string`

The reason phrase.

#### Returns

`ResponseStatus`

## Properties

### code

> `readonly` **code**: `number`

The numeric HTTP status code.

***

### text

> `readonly` **text**: `string`

The reason phrase associated with the status code.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

***

### isClientErrorClass

#### Get Signature

> **get** **isClientErrorClass**(): `boolean`

Whether the status code is in the 4xx client error range.

##### Returns

`boolean`

***

### isInformationClass

#### Get Signature

> **get** **isInformationClass**(): `boolean`

Whether the status code is in the 1xx informational range.

##### Returns

`boolean`

***

### isRedirectClass

#### Get Signature

> **get** **isRedirectClass**(): `boolean`

Whether the status code is in the 3xx redirect range.

##### Returns

`boolean`

***

### isServerErrorClass

#### Get Signature

> **get** **isServerErrorClass**(): `boolean`

Whether the status code is in the 5xx server error range.

##### Returns

`boolean`

***

### isSuccessClass

#### Get Signature

> **get** **isSuccessClass**(): `boolean`

Whether the status code is in the 2xx success range.

##### Returns

`boolean`

## Methods

### compareTo()

> **compareTo**(`value`): `number`

Compares this status with another status.

#### Parameters

##### value

`ResponseStatus`

The status to compare against.

#### Returns

`number`

A negative, zero, or positive comparison result.

#### Implementation of

`Comparable.compareTo`

***

### createResponse()

> **createResponse**(`body`, `headers?`): `Response`

Creates a `Response` using this status and the supplied body.

#### Parameters

##### body

`BodyInit`

The response body.

##### headers?

`HeadersInit` = `{}`

Optional headers to apply to the response.

#### Returns

`Response`

A new `Response` using this status code and text.

***

### equals()

> **equals**(`value`): `boolean`

Tests whether this status matches another status.

#### Parameters

##### value

`ResponseStatus`

The status to compare against.

#### Returns

`boolean`

`true` when both code and text match.

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `JSONObject`

Serializes the status to a JSON object.

#### Returns

`JSONObject`

A JSON object containing the status code and text.

#### Implementation of

`Serializable.toJSON`

***

### toResponseInit()

> **toResponseInit**(): `ResponseInit`

Converts the status to `ResponseInit` fields.

#### Returns

`ResponseInit`

A `ResponseInit` object with `status` and `statusText`.

***

### toString()

> **toString**(): `string`

Formats the status as `"<code> <text>"`.

#### Returns

`string`

The formatted status string.

#### Implementation of

`Serializable.toString`

***

### for()

Resolves a status for a code or response.

#### Param

**codeOrResponse**

The numeric code or response.

#### Param

**text**

Optional reason phrase.

#### Call Signature

> `static` **for**(`response`): `ResponseStatus`

Returns a cached status for the given response.

##### Parameters

###### response

`Response`

The response to inspect.

##### Returns

`ResponseStatus`

The matching status, or `null` when the response status is unknown.

#### Call Signature

> `static` **for**(`code`, `text?`): `ResponseStatus`

Returns a cached status for the given code.

##### Parameters

###### code

`number`

The numeric status code.

###### text?

`string`

Optional reason phrase used when creating a new status.

##### Returns

`ResponseStatus`

The matching or newly created status, or `null` when no text is provided.
