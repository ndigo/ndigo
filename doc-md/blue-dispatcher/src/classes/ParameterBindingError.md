[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParameterBindingError

# Class: ParameterBindingError

Defined in: packages/blue-dispatcher/src/error.ts:121

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

Defined in: packages/blue-dispatcher/src/error.ts:130

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

> `readonly` **parameterName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:122

***

### methodName

> `readonly` **methodName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:123

***

### controllerName

> `readonly` **controllerName**: `string`

Defined in: packages/blue-dispatcher/src/error.ts:124

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-dispatcher/src/error.ts:126

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
