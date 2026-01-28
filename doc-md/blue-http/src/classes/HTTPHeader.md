[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / HTTPHeader

# Class: HTTPHeader

Defined in: packages/blue-http/src/http-header.ts:96

## Implements

- [`Serializable`](../../../blue-core/src/interfaces/Serializable.md)

## Constructors

### Constructor

> **new HTTPHeader**(`name`): `HTTPHeader`

Defined in: packages/blue-http/src/http-header.ts:103

#### Parameters

##### name

`string`

#### Returns

`HTTPHeader`

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-http/src/http-header.ts:97

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-http/src/http-header.ts:99

##### Returns

`string`

## Methods

### delete()

> **delete**(`headers`): `void`

Defined in: packages/blue-http/src/http-header.ts:115

#### Parameters

##### headers

`HeadersInit`

#### Returns

`void`

***

### get()

> **get**(`headers`): `string`

Defined in: packages/blue-http/src/http-header.ts:119

#### Parameters

##### headers

`HeadersInit`

#### Returns

`string`

***

### has()

> **has**(`headers`): `boolean`

Defined in: packages/blue-http/src/http-header.ts:123

#### Parameters

##### headers

`HeadersInit`

#### Returns

`boolean`

***

### set()

> **set**(`headers`, `value`): `void`

Defined in: packages/blue-http/src/http-header.ts:127

#### Parameters

##### headers

`HeadersInit`

##### value

`any`

#### Returns

`void`

***

### toJSON()

> **toJSON**(): [`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

Defined in: packages/blue-http/src/http-header.ts:137

#### Returns

[`JSONValue`](../../../blue-core/src/type-aliases/JSONValue.md)

A JSON representation of the HTTP header

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toJSON`](../../../blue-core/src/interfaces/Serializable.md#tojson)

***

### toString()

> **toString**(): `string`

Defined in: packages/blue-http/src/http-header.ts:144

#### Returns

`string`

A string representation of the HTTP header

#### Implementation of

[`Serializable`](../../../blue-core/src/interfaces/Serializable.md).[`toString`](../../../blue-core/src/interfaces/Serializable.md#tostring)
