[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / Stringifier

# Interface: Stringifier\<T\>

Class-based interface for serializing a value of type `T` into a string.

Represents the class-based form of `Converter<T, string>` from `@ndigo/core/converter`.
Implement this interface when the stringifier needs to be registered, injected, or composed as an object.
For standalone utility functions, use the `stringify*` or `to*` naming convention
and type with `Converter<T, string>` directly (imported from `'@ndigo/core'`).

## Type Parameters

### T

`T` = `unknown`

The type of the value to stringify.

## Methods

### stringify()

> **stringify**(`value`): `string`

Stringifies a value of type T into its string representation.

#### Parameters

##### value

`T`

The value of type T to stringify.

#### Returns

`string`

The string representation of the value.
