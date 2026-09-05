[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / Type

# Class: Type

Defined in: [packages/blue-validate/src/type.ts:50](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-50)

Represents a reusable validation type, encapsulating a set of constraints and a validation backend.
This class allows for defining complex validation rules that can be applied to various values.

## Constructors

### Constructor

> **new Type**(`name`, `definition`, `backend?`): `Type`

Defined in: [packages/blue-validate/src/type.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-62)

Creates an instance of `Type`.

#### Parameters

##### name

`string`

The name of this validation type.

##### definition

[`TypeDefinition`](../type-aliases/TypeDefinition.md)

The definition of the type, including its constraints.

##### backend?

`ValidationBackendAdapter` = `defaultValidationBackend`

The validation backend to use for this type.

#### Returns

`Type`

#### Throws

If `definition.constraints` is not an array, or if any constraint within the definition is invalid or unregistered.

## Properties

### name

> `readonly` **name**: `string`

Defined in: [packages/blue-validate/src/type.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-51)

***

### constraints

> `readonly` **constraints**: `object`[]

Defined in: [packages/blue-validate/src/type.ts:52](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-52)

#### type

> **type**: `string`

#### params?

> `optional` **params?**: `Record`\<`string`, `unknown`\>

#### groups?

> `optional` **groups?**: `symbol`[]

***

### backend

> `readonly` **backend**: `ValidationBackendAdapter`

Defined in: [packages/blue-validate/src/type.ts:53](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-53)

## Methods

### validator()

> **validator**(`value`, `params?`): `boolean`

Defined in: [packages/blue-validate/src/type.ts:128](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-128)

Checks if a value is valid according to the type's constraints.
This method returns a boolean indicating overall validity.

#### Parameters

##### value

`unknown`

The value to validate.

##### params?

`ValidationOptions` = `{}`

Optional parameters for the validation process, including active groups.

#### Returns

`boolean`

True if the value passes all applicable constraints, false otherwise.

***

### validate()

> **validate**(`value`, `params?`): `ValidationResults`

Defined in: [packages/blue-validate/src/type.ts:148](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/type.ts#lines-148)

Validates a value against the type's constraints and returns detailed results.
This method provides a comprehensive object including validity status and a list of failed constraints.

#### Parameters

##### value

`unknown`

The value to validate.

##### params?

`ValidationOptions` = `{}`

Optional parameters for the validation process, including active groups.

#### Returns

`ValidationResults`

An object containing the validation outcome, including `isValid` and `failedConstraints`.
