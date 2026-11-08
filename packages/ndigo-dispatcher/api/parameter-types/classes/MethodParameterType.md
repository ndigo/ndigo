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

The serialized type string (e.g. `query:value`).

***

### ATTRIBUTE

> `static` **ATTRIBUTE**: `MethodParameterType`

Route-attribute parameter type.

***

### BODY

> `static` **BODY**: `MethodParameterType`

Body parameter type.

***

### COOKIE

> `static` **COOKIE**: `MethodParameterType`

Cookie parameter type.

***

### HEADER

> `static` **HEADER**: `MethodParameterType`

Header parameter type.

***

### HISTORY\_STATE

> `static` **HISTORY\_STATE**: `MethodParameterType`

History-state parameter type.

***

### LOCAL\_STORAGE

> `static` **LOCAL\_STORAGE**: `MethodParameterType`

Local-storage parameter type.

***

### MATRIX

> `static` **MATRIX**: `MethodParameterType`

Matrix parameter type.

***

### MULTIPART\_FILE

> `static` **MULTIPART\_FILE**: `MethodParameterType`

Multipart-file parameter type.

***

### PATH

> `static` **PATH**: `MethodParameterType`

Path-variable parameter type.

***

### QUERY

> `static` **QUERY**: `MethodParameterType`

Query parameter type.

***

### REQUEST\_PART

> `static` **REQUEST\_PART**: `MethodParameterType`

Request-part parameter type.

***

### REQUEST\_SESSION

> `static` **REQUEST\_SESSION**: `MethodParameterType`

Request-session parameter type.

***

### ROUTE

> `static` **ROUTE**: `MethodParameterType`

Route-object parameter type.

***

### SESSION\_STORAGE

> `static` **SESSION\_STORAGE**: `MethodParameterType`

Session-storage parameter type.

***

### SOCKET\_SESSION

> `static` **SOCKET\_SESSION**: `MethodParameterType`

Socket-session parameter type.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

##### Returns

`string`

## Methods

### equals()

> **equals**(`value`): `boolean`

Compares this type with another value by serialized form.

#### Parameters

##### value

`unknown`

The value to compare.

#### Returns

`boolean`

Whether both are the same parameter type.

#### Implementation of

`Equatable.equals`

***

### toJSON()

> **toJSON**(): `string`

Serializes the type.

#### Returns

`string`

The serialized type string.

#### Implementation of

`Serializable.toJSON`

***

### toString()

> **toString**(): `string`

Returns the serialized type string.

#### Returns

`string`

The type string.

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

Resolves a serialized type string to its cached instance.

#### Parameters

##### type

`string`

The serialized type string.

#### Returns

`MethodParameterType` \| `null`

The matching type, or `null`.
