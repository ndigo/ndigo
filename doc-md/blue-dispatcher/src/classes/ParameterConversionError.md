[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / ParameterConversionError

# Class: ParameterConversionError

Defined in: [packages/blue-dispatcher/src/error.ts:185](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-185)

Thrown when a parameter converter fails at runtime.
This is a RUNTIME error (request processing time).

## Extends

- [`ParameterBindingError`](ParameterBindingError.md)

## Constructors

### Constructor

> **new ParameterConversionError**(`parameterName`, `parameterType`, `cause?`, `methodName?`, `controllerName?`): `ParameterConversionError`

Defined in: [packages/blue-dispatcher/src/error.ts:193](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-193)

#### Parameters

##### parameterName

`string`

##### parameterType

`string`

##### cause?

`Error`

##### methodName?

`string`

##### controllerName?

`string`

#### Returns

`ParameterConversionError`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`constructor`](ParameterBindingError.md#constructor)

## Properties

### parameterName

> `readonly` **parameterName**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/error.ts:87](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-87)

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`parameterName`](ParameterBindingError.md#parametername)

***

### methodName

> `readonly` **methodName**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/error.ts:88](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-88)

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`methodName`](ParameterBindingError.md#methodname)

***

### controllerName

> `readonly` **controllerName**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/error.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-89)

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`controllerName`](ParameterBindingError.md#controllername)

***

### parameterType

> `readonly` **parameterType**: `string` \| `null`

Defined in: [packages/blue-dispatcher/src/error.ts:186](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-186)

***

### cause

> `readonly` **cause**: `Error` \| `null`

Defined in: [packages/blue-dispatcher/src/error.ts:187](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-187)

#### Overrides

`ParameterBindingError.cause`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-dispatcher/src/error.ts:189](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/error.ts#lines-189)

##### Returns

`string`

#### Overrides

[`ParameterBindingError`](ParameterBindingError.md).[`[toStringTag]`](ParameterBindingError.md#tostringtag)

## Methods

### toString()

> **toString**(): `string`

Defined in: packages/blue-core/lib/serializable.d.ts:22

#### Returns

`string`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toString`](ParameterBindingError.md#tostring)

***

### toJSON()?

> `optional` **toJSON**(): `JSONValue`

Defined in: packages/blue-core/lib/serializable.d.ts:23

#### Returns

`JSONValue`

#### Inherited from

[`ParameterBindingError`](ParameterBindingError.md).[`toJSON`](ParameterBindingError.md#tojson)
