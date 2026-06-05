[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / CompositeConstraintType

# Interface: CompositeConstraintType\<T\>

Defined in: packages/blue-validate/src/constraint.ts:47

Defines the interface for a validation constraint.

## Type Parameters

### T

`T` = `serializable`

The type of the value that this constraint can validate.

## Properties

### validate

> **validate**: `constraint`\<`T`\>

Defined in: packages/blue-validate/src/constraint.ts:54

The validation function for the constraint.

#### Param

Parameters for the constraint.

#### Param

The value to validate.

#### Returns

True if the value is valid, false otherwise.
