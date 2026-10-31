[**@blue/http v0.0.1**](../../README.md)

***

[@blue/http](../../README.md) / [blue-http](../README.md) / ContentTypeHeader

# Class: ContentTypeHeader

Content-Type header category: value parsing on the constant itself.

```ts
HTTPHeaders.CONTENT_TYPE.baseValue('multipart/form-data; boundary=abc'); // 'multipart/form-data'
HTTPHeaders.CONTENT_TYPE.boundary('multipart/form-data; BOUNDARY="x"');  // 'x'
```

## Extends

- [`HTTPHeader`](HTTPHeader.md)

## Constructors

### Constructor

> **new ContentTypeHeader**(`name`): `ContentTypeHeader`

Creates a header helper for the given name.

#### Parameters

##### name

`string`

The header name to target.

#### Returns

`ContentTypeHeader`

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`constructor`](HTTPHeader.md#constructor)

## Properties

### name

> `readonly` **name**: `string`

The canonical header name used for reads and writes.

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`name`](HTTPHeader.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`[toStringTag]`](HTTPHeader.md#tostringtag)

## Methods

### baseValue()

> **baseValue**(`contentType`): `string` \| `null`

The bare media type of a `Content-Type` value (see
[contentTypeBase](../functions/contentTypeBase.md)).

#### Parameters

##### contentType

`string` \| `null` \| `undefined`

#### Returns

`string` \| `null`

***

### boundary()

> **boundary**(`contentType`): `string` \| `null`

The multipart boundary of a `Content-Type` value (see
[multipartBoundary](../functions/multipartBoundary.md)).

#### Parameters

##### contentType

`string` \| `null` \| `undefined`

#### Returns

`string` \| `null`

***

### delete()

> **delete**(`headers`): `void`

Removes this header from a header collection when present.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to mutate.

#### Returns

`void`

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`delete`](HTTPHeader.md#delete)

***

### get()

> **get**(`headers`): `string` \| `null`

Reads this header from a header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to read from.

#### Returns

`string` \| `null`

The header value, or `null` when missing.

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`get`](HTTPHeader.md#get)

***

### getJoined()

> **getJoined**(`headers`, `separator?`): `string` \| `null`

Reads this header from a header collection, joining multi-value
entries (`string[]` — Node server records) into one string.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to read from.

##### separator?

`string` = `', '`

The join separator (default `', '`).

#### Returns

`string` \| `null`

The header value, or `null` when missing.

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`getJoined`](HTTPHeader.md#getjoined)

***

### has()

> **has**(`headers`): `boolean`

Tests whether this header exists in a header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to inspect.

#### Returns

`boolean`

`true` when the header exists.

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`has`](HTTPHeader.md#has)

***

### set()

> **set**(`headers`, `value`): `void`

Writes this header into a mutable header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to mutate.

##### value

`unknown`

The header value to store.

#### Returns

`void`

#### Throws

When `headers` is not provided.

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`set`](HTTPHeader.md#set)

***

### toJSON()

> **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

A JSON representation of the HTTP header

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`toJSON`](HTTPHeader.md#tojson)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

A string representation of the HTTP header

#### Inherited from

[`HTTPHeader`](HTTPHeader.md).[`toString`](HTTPHeader.md#tostring)
