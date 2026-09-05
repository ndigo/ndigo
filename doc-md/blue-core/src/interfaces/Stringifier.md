[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / Stringifier

# Interface: Stringifier\<T\>

Defined in: [packages/blue-core/src/parser.ts:46](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/parser.ts#lines-46)

Class-based interface for serializing a value of type `T` into a string.

Represents the class-based form of `Converter<T, string>` from `@blue/core/converter`.
Implement this interface when the stringifier needs to be registered, injected, or composed as an object.
For standalone utility functions, use the `stringify*` or `to*` naming convention
and type with `Converter<T, string>` directly (imported from `'@blue/core'`).

## Type Parameters

### T

`T` = `any`

The type of the value to stringify.

## Methods

### stringify()

> **stringify**(`value`): `string`

Defined in: [packages/blue-core/src/parser.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/parser.ts#lines-52)

Stringifies a value of type T into its string representation.

#### Parameters

##### value

`T`

The value of type T to stringify.

#### Returns

`string`

The string representation of the value.
