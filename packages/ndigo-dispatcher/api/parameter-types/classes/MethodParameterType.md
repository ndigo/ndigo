[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-types](../README.md) / MethodParameterType

# Class: MethodParameterType

Method parameter type enum

## Implements

- `Equatable`
- `Serializable`

## Constructors

### Constructor

> **new MethodParameterType**(`type`): `MethodParameterType`

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType`

## Properties

### type

> `readonly` **type**: `string`

***

### ATTRIBUTE

> `static` **ATTRIBUTE**: `MethodParameterType`

***

### BODY

> `static` **BODY**: `MethodParameterType`

***

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

***

### HEADER

> `static` **HEADER**: `MethodParameterType`

***

### HISTORY\_STATE

> `static` **HISTORY\_STATE**: `MethodParameterType`

***

### LOCAL\_STORAGE

> `static` **LOCAL\_STORAGE**: `MethodParameterType`

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

***

### MULTIPART\_FILE

> `static` **MULTIPART\_FILE**: `MethodParameterType`

***

### PATH

> `static` **PATH**: `MethodParameterType`

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

***

### REQUEST\_PART

> `static` **REQUEST\_PART**: `MethodParameterType`

***

### REQUEST\_SESSION

> `static` **REQUEST\_SESSION**: `MethodParameterType`

***

### ROUTE

> `static` **ROUTE**: `MethodParameterType`

***

### SESSION\_STORAGE

> `static` **SESSION\_STORAGE**: `MethodParameterType`

***

### SOCKET\_SESSION

> `static` **SOCKET\_SESSION**: `MethodParameterType`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### equals()

> **equals**(`value`): `boolean`

Determines if this object is equal to the specified value.

#### Parameters

##### value

`unknown`

The value to compare with this object.

#### Returns

`boolean`

`true` if the objects are equal, `false` otherwise.

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `string`

#### Returns

`string`

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns a string representation of an object.

#### Returns

`string`

#### Implementation of

`Serializable.toString`

***

### data()

> `static` **data**(`source`): `MethodParameterType`

Whole-source data-binding types (`data-{source}:value`, D-3).

The source is encoded in the type — `dataBinderValue('body')` produces
`data-body:value` — and the instances are cached so type-equality via
`Set.has` in the `SOURCES_BY_KIND` membership checks holds.

#### Parameters

##### source

`string`

The data source name (`'query'`, `'body'`, `'cookie'`,
  `'session-storage'`, `'local-storage'`).

#### Returns

`MethodParameterType`

The cached type instance for `data-{source}:value`.

***

### fromType()

> `static` **fromType**(`type`): `MethodParameterType` \| `null`

#### Parameters

##### type

`string`

#### Returns

`MethodParameterType` \| `null`
