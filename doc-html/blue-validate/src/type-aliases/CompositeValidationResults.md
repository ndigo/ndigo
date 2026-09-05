[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / CompositeValidationResults

# Type Alias: CompositeValidationResults\<T, U\>

> **CompositeValidationResults**\<`T`, `U`\> = `object`

Defined in: [packages/blue-validate/src/constraint.ts:26](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-26)

Represents the detailed results of a validation operation.

## Type Parameters

### T

`T` = `serializable`

The type of the value that was validated.

### U

`U` = `any`

The type of parameters used during validation.

## Properties

### name

> **name**: `string`

Defined in: [packages/blue-validate/src/constraint.ts:27](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-27)

The name of the constraint or type that was validated.

***

### params

> **params**: [`CompositeConstraintParams`](CompositeConstraintParams.md)\<`U`\>

Defined in: [packages/blue-validate/src/constraint.ts:28](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-28)

The parameters passed to the validation.

***

### value

> **value**: `T`

Defined in: [packages/blue-validate/src/constraint.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-29)

The value that was validated.

***

### isValid

> **isValid**: `boolean`

Defined in: [packages/blue-validate/src/constraint.ts:30](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-30)

True if the validation passed, false otherwise.

***

### violations

> **violations**: [`CompositeConstraintType`](../interfaces/CompositeConstraintType.md)\<`T`\>[]

Defined in: [packages/blue-validate/src/constraint.ts:31](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-31)

An array of constraints that were violated.
