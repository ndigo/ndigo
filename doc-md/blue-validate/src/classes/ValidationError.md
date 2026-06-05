[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / ValidationError

# Class: ValidationError

Defined in: packages/blue-validate/src/error.ts:7

Base error class for all validation-related failures.

## Extends

- `Error`

## Extended by

- [`ConstraintViolationError`](ConstraintViolationError.md)

## Constructors

### Constructor

> **new ValidationError**(`message`, `cause?`): `ValidationError`

Defined in: packages/blue-validate/src/error.ts:19

Creates an instance of ValidationError.

#### Parameters

##### message

`string`

A descriptive message for the validation error.

##### cause?

`Error` = `null`

The original error that caused this validation failure.

#### Returns

`ValidationError`

#### Overrides

`Error.constructor`

## Properties

### cause

> **cause**: `Error`

Defined in: packages/blue-validate/src/error.ts:8

The underlying cause of the validation error, if any.

#### Overrides

`Error.cause`

## Accessors

### \[toStringTag\]

#### Get Signature

> **get** **\[toStringTag\]**(): `string`

Defined in: packages/blue-validate/src/error.ts:10

##### Returns

`string`
