[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ConstraintViolationError

# Class: ConstraintViolationError

Defined in: [packages/blue-validate/src/error.ts:36](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/error.ts#lines-36)

Error thrown when one or more validation constraints are violated.

## Extends

- [`ValidationError`](ValidationError.md)

## Constructors

### Constructor

> **new ConstraintViolationError**(`message`, `violations`): `ConstraintViolationError`

Defined in: [packages/blue-validate/src/error.ts:51](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/error.ts#lines-51)

Creates an instance of ConstraintViolationError.

#### Parameters

##### message

`string`

A descriptive message for the constraint violation.

##### violations

`Set`\<`string`\>

A set of constraint names that were violated.

#### Returns

`ConstraintViolationError`

#### Overrides

[`ValidationError`](ValidationError.md).[`constructor`](ValidationError.md#constructor)

## Properties

### cause

> **cause**: `Error`

Defined in: [packages/blue-validate/src/error.ts:8](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/error.ts#lines-8)

The underlying cause of the validation error, if any.

#### Inherited from

[`ValidationError`](ValidationError.md).[`cause`](ValidationError.md#cause)

***

### violations

> `readonly` **violations**: `ReadonlySet`\<`string`\>

Defined in: [packages/blue-validate/src/error.ts:40](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/error.ts#lines-40)

The set of constraint names that were violated.

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: [packages/blue-validate/src/error.ts:42](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/error.ts#lines-42)

##### Returns

`string`

#### Overrides

[`ValidationError`](ValidationError.md).[`[toStringTag]`](ValidationError.md#tostringtag)
