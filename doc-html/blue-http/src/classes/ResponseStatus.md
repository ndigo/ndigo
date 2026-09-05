[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / ResponseStatus

# Class: ResponseStatus

Defined in: [packages/blue-http/src/response-status.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-28)

Represents an HTTP response status code and reason phrase.

Instances are cached by code so repeated lookups return the same object when
possible.

## See

[https://tools.ietf.org/html/rfc2616#section-10](https://tools.ietf.org/html/rfc2616#section-10)

## Implements

- `Comparable`\<`ResponseStatus`\>
- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new ResponseStatus**(`code`, `text`): `ResponseStatus`

Defined in: [packages/blue-http/src/response-status.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-120)

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

Defined in: [packages/blue-http/src/response-status.ts:32](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-32)

The numeric HTTP status code.

***

### text

> `readonly` **text**: `string`

Defined in: [packages/blue-http/src/response-status.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-37)

The reason phrase associated with the status code.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-http/src/response-status.ts:75](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-75)

##### Returns

`string`

***

### isInformationClass

#### Get Signature

> **get** **isInformationClass**(): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:82](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-82)

Whether the status code is in the 1xx informational range.

##### Returns

`boolean`

***

### isSuccessClass

#### Get Signature

> **get** **isSuccessClass**(): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-89)

Whether the status code is in the 2xx success range.

##### Returns

`boolean`

***

### isRedirectClass

#### Get Signature

> **get** **isRedirectClass**(): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:96](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-96)

Whether the status code is in the 3xx redirect range.

##### Returns

`boolean`

***

### isClientErrorClass

#### Get Signature

> **get** **isClientErrorClass**(): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:103](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-103)

Whether the status code is in the 4xx client error range.

##### Returns

`boolean`

***

### isServerErrorClass

#### Get Signature

> **get** **isServerErrorClass**(): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-110)

Whether the status code is in the 5xx server error range.

##### Returns

`boolean`

## Methods

### for()

#### Call Signature

> `static` **for**(`response`): `ResponseStatus`

Defined in: [packages/blue-http/src/response-status.ts:45](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-45)

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

Defined in: [packages/blue-http/src/response-status.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-53)

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

***

### compareTo()

> **compareTo**(`value`): `number`

Defined in: [packages/blue-http/src/response-status.ts:145](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-145)

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

### equals()

> **equals**(`value`): `boolean`

Defined in: [packages/blue-http/src/response-status.ts:169](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-169)

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

### createResponse()

> **createResponse**(`body`, `headers?`): `Response`

Defined in: [packages/blue-http/src/response-status.ts:180](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-180)

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

### toJSON()

> **toJSON**(): `JSONObject`

Defined in: [packages/blue-http/src/response-status.ts:189](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-189)

Serializes the status to a JSON object.

#### Returns

`JSONObject`

A JSON object containing the status code and text.

#### Implementation of

`Serializable.toJSON`

***

### toResponseInit()

> **toResponseInit**(): `ResponseInit`

Defined in: [packages/blue-http/src/response-status.ts:203](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-203)

Converts the status to `ResponseInit` fields.

#### Returns

`ResponseInit`

A `ResponseInit` object with `status` and `statusText`.

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-http/src/response-status.ts:217](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/response-status.ts#lines-217)

Formats the status as `"<code> <text>"`.

#### Returns

`string`

The formatted status string.

#### Implementation of

`Serializable.toString`
