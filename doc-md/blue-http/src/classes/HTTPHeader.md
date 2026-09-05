[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPHeader

# Class: HTTPHeader

Defined in: [packages/blue-http/src/http-header.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-101)

Represents a single HTTP header name with helpers for common header collections.

The instance stores only the header name; read and write methods adapt the
name to `Headers`, header tuples, and plain object maps.

## Implements

- `Serializable`

## Constructors

### Constructor

> **new HTTPHeader**(`name`): `HTTPHeader`

Defined in: [packages/blue-http/src/http-header.ts:116](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-116)

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

Defined in: [packages/blue-http/src/http-header.ts:105](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-105)

The canonical header name used for reads and writes.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-http/src/http-header.ts:107](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-107)

##### Returns

`string`

## Methods

### delete()

> **delete**(`headers`): `void`

Defined in: [packages/blue-http/src/http-header.ts:133](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-133)

Removes this header from a header collection when present.

#### Parameters

##### headers

`HeadersInit`

The header collection to mutate.

#### Returns

`void`

***

### get()

> **get**(`headers`): `string` \| `null`

Defined in: [packages/blue-http/src/http-header.ts:145](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-145)

Reads this header from a header collection.

#### Parameters

##### headers

`HeadersInit`

The header collection to read from.

#### Returns

`string` \| `null`

The header value, or `null` when missing.

***

### has()

> **has**(`headers`): `boolean`

Defined in: [packages/blue-http/src/http-header.ts:155](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-155)

Tests whether this header exists in a header collection.

#### Parameters

##### headers

`HeadersInit`

The header collection to inspect.

#### Returns

`boolean`

`true` when the header exists.

***

### set()

> **set**(`headers`, `value`): `void`

Defined in: [packages/blue-http/src/http-header.ts:166](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-166)

Writes this header into a mutable header collection.

#### Parameters

##### headers

`HeadersInit`

The header collection to mutate.

##### value

`any`

The header value to store.

#### Returns

`void`

#### Throws

When `headers` is not provided.

***

### toJSON()

> **toJSON**(): `JSONValue`

Defined in: [packages/blue-http/src/http-header.ts:176](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-176)

#### Returns

`JSONValue`

A JSON representation of the HTTP header

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Defined in: [packages/blue-http/src/http-header.ts:183](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-http/src/http-header.ts#lines-183)

#### Returns

`string`

A string representation of the HTTP header

#### Implementation of

`Serializable.toString`
