[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / Validator

# Interface: Validator

Defined in: packages/blue-validate/src/validator.ts:16

Defines the interface for a validator, capable of validating a serializable value against a named type.

## Methods

### validate()

> **validate**(`value`, `name`, `params?`): `ValidationResults`

Defined in: packages/blue-validate/src/validator.ts:24

Validates a given value against a specified type.

#### Parameters

##### value

`serializable`

The value to validate.

##### name

`string`

The name of the validation type to use.

##### params?

`ValidationOptions`

Optional parameters for the validation process.

#### Returns

`ValidationResults`

The results of the validation.
