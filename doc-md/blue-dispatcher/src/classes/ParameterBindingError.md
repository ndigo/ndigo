[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParameterBindingError

# Class: ParameterBindingError

Defined in: packages/blue-dispatcher/src/error.ts:86

Base error for method parameter binding issues.
Analogous to Spring's ServletRequestBindingException.

## Extends

- `FrameworkError`

## Extended by

- [`InvalidParameterMappingError`](InvalidParameterMappingError.md)
- [`MissingParameterError`](MissingParameterError.md)
- [`ParameterConversionError`](ParameterConversionError.md)

## Constructors

### Constructor

> **new ParameterBindingError**(`message`, `parameterName?`, `methodName?`, `controllerName?`): `ParameterBindingError`

Defined in: packages/blue-dispatcher/src/error.ts:95

#### Parameters

##### message

`string`

##### parameterName?

`string`

##### methodName?

`string`

##### controllerName?

`string`

#### Returns

`ParameterBindingError`

#### Overrides

`FrameworkError.constructor`

## Properties

### parameterName

> `readonly` **parameterName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:87

***

### methodName

> `readonly` **methodName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:88

***

### controllerName

> `readonly` **controllerName**: `string` \| `null`

Defined in: packages/blue-dispatcher/src/error.ts:89

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:91

##### Returns

`string`

#### Overrides

`FrameworkError.[toStringTag]`

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

`FrameworkError.toString`

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

`FrameworkError.toJSON`
