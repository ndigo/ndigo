[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [authorization-header](../README.md) / AuthorizationHeader

# Class: AuthorizationHeader

Authorization header category: credential-scheme parsing on the constant
itself.

```ts
HTTPHeaders.AUTHORIZATION.bearerToken('Bearer abc.def') // 'abc.def'
HTTPHeaders.AUTHORIZATION.bearerToken(null)            // undefined
```

## Extends

- [`HTTPHeader`](../../http-header/classes/HTTPHeader.md)

## Constructors

### Constructor

> **new AuthorizationHeader**(`name`): `AuthorizationHeader`

Creates a header helper for the given name.

#### Parameters

##### name

`string`

The header name to target.

#### Returns

`AuthorizationHeader`

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`constructor`](../../http-header/classes/HTTPHeader.md#constructor)

## Properties

### name

> `readonly` **name**: `string`

The canonical header name used for reads and writes.

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`name`](../../http-header/classes/HTTPHeader.md#name)

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`[toStringTag]`](../../http-header/classes/HTTPHeader.md#tostringtag)

## Methods

### bearerToken()

> **bearerToken**(`authorization`): `string` \| `undefined`

Extracts the `Bearer`-scheme credential from an `Authorization`
value (scheme case-insensitive, surrounding whitespace tolerated).
`undefined` when the value is absent (`undefined`/`null` — header
resolvers bind `null` for a missing header), not bearer-shaped, or
carries no token; callers treat `undefined` as unauthenticated.

#### Parameters

##### authorization

`string` \| `null` \| `undefined`

The raw `Authorization` header value.

#### Returns

`string` \| `undefined`

***

### delete()

> **delete**(`headers`): `void`

Removes this header from a header collection when present.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../../http-header/type-aliases/HeaderRecord.md)

The header collection to mutate.

#### Returns

`void`

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`delete`](../../http-header/classes/HTTPHeader.md#delete)

***

### get()

> **get**(`headers`): `string` \| `null`

Reads this header from a header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../../http-header/type-aliases/HeaderRecord.md)

The header collection to read from.

#### Returns

`string` \| `null`

The header value, or `null` when missing.

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`get`](../../http-header/classes/HTTPHeader.md#get)

***

### getJoined()

> **getJoined**(`headers`, `separator?`): `string` \| `null`

Reads this header from a header collection, joining multi-value
entries (`string[]` — Node server records) into one string.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../../http-header/type-aliases/HeaderRecord.md)

The header collection to read from.

##### separator?

`string` = `', '`

The join separator (default `', '`).

#### Returns

`string` \| `null`

The header value, or `null` when missing.

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`getJoined`](../../http-header/classes/HTTPHeader.md#getjoined)

***

### has()

> **has**(`headers`): `boolean`

Tests whether this header exists in a header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../../http-header/type-aliases/HeaderRecord.md)

The header collection to inspect.

#### Returns

`boolean`

`true` when the header exists.

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`has`](../../http-header/classes/HTTPHeader.md#has)

***

### set()

> **set**(`headers`, `value`): `void`

Writes this header into a mutable header collection.

#### Parameters

##### headers

`HeadersInit` \| [`HeaderRecord`](../../http-header/type-aliases/HeaderRecord.md)

The header collection to mutate.

##### value

`unknown`

The header value to store.

#### Returns

`void`

#### Throws

When `headers` is not provided.

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`set`](../../http-header/classes/HTTPHeader.md#set)

***

### toJSON()

> **toJSON**(): `JSONValue`

#### Returns

`JSONValue`

A JSON representation of the HTTP header

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`toJSON`](../../http-header/classes/HTTPHeader.md#tojson)

***

### toString()

> **toString**(): `string`

#### Returns

`string`

A string representation of the HTTP header

#### Inherited from

[`HTTPHeader`](../../http-header/classes/HTTPHeader.md).[`toString`](../../http-header/classes/HTTPHeader.md#tostring)
