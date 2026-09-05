[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / CompositeConstraint

# Class: CompositeConstraint\<T\>

Defined in: [packages/blue-validate/src/constraint.ts:61](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-61)

A constraint that combines multiple individual constraints, requiring all of them to pass for overall validity.

## Type Parameters

### T

`T` = `serializable`

The type of the value that this composite constraint can validate.

## Implements

- [`CompositeConstraintType`](../interfaces/CompositeConstraintType.md)\<`T`\>

## Constructors

### Constructor

> **new CompositeConstraint**\<`T`\>(`constraints`): `CompositeConstraint`\<`T`\>

Defined in: [packages/blue-validate/src/constraint.ts:69](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-69)

Creates an instance of `CompositeConstraint`.

#### Parameters

##### constraints

[`CompositeConstraintType`](../interfaces/CompositeConstraintType.md)\<`T`\>[]

An array of constraints to be combined.

#### Returns

`CompositeConstraint`\<`T`\>

#### Throws

If the `constraints` array is empty.

## Properties

### constraints

> **constraints**: [`CompositeConstraintType`](../interfaces/CompositeConstraintType.md)\<`T`\>[]

Defined in: [packages/blue-validate/src/constraint.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-62)

## Methods

### validate()

> **validate**(`params`, `value`): `boolean`

Defined in: [packages/blue-validate/src/constraint.ts:89](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/constraint.ts#lines-89)

Validates a value against all contained constraints.
All constraints must pass for this composite constraint to be considered valid.

#### Parameters

##### params

[`CompositeConstraintParams`](../type-aliases/CompositeConstraintParams.md)

Parameters for the constraint.

##### value

`T`

The value to validate.

#### Returns

`boolean`

True if all contained constraints pass, false otherwise.

#### Implementation of

`Constraint.validate`
