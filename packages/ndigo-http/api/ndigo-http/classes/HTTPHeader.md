[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [ndigo-http](../README.md) / HTTPHeader

# Class: HTTPHeader

Represents a single HTTP header name with helpers for common header collections.

The instance stores only the header name; read and write methods adapt the
name to `Headers`, header tuples, and plain object maps.

## Extended by

- [`AuthorizationHeader`](AuthorizationHeader.md)
- [`ContentTypeHeader`](ContentTypeHeader.md)
- [`SetCookieHeader`](SetCookieHeader.md)

## Implements

- `Serializable`

## Constructors

### Constructor

> **new HTTPHeader**(`name`): `HTTPHeader`

Creates a header helper for the given name.

#### Parameters

##### name

`string`

The header name to target.

#### Returns

`HTTPHeader`

## Properties

### name

> `readonly` **name**: `string`

The canonical header name used for reads and writes.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### delete()

> **delete**(`headers`): `void`

Removes this header from a header collection when present.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../type-aliases/HeaderRecord.md)

The header collection to mutate.

#### Returns

`void`

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

***

### toJSON()

> **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

A JSON representation of the HTTP header

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

#### Returns

`string`

A string representation of the HTTP header

#### Implementation of

`Serializable.toString`
