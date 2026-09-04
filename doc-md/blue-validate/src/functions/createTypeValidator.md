[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / createTypeValidator

# Function: createTypeValidator()

> **createTypeValidator**(`types`, `backend?`): `TypeValidator`

Defined in: packages/blue-validate/src/validator.ts:122

Factory function to create a new `TypeValidator` instance.

## Parameters

### types

`Record`\<`string`, [`TypeDefinition`](../type-aliases/TypeDefinition.md)\>

An object mapping type names to their definitions.

### backend?

`"native"` = `'native'`

The name of the validation backend to use.

## Returns

`TypeValidator`

A new `TypeValidator` instance.
