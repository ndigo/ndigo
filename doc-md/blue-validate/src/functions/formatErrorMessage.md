[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-validate/src](../README.md) / formatErrorMessage

# Function: formatErrorMessage()

> **formatErrorMessage**(`constraintName`, `propertyName`, `value`, `message?`): `string`

Defined in: [packages/blue-validate/src/decorators.ts:131](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-validate/src/decorators.ts#lines-131)

Formats a validation error message.

Override this function to customize or localize error messages.
The default format returns English messages.

## Parameters

### constraintName

`string`

The name of the constraint that failed.

### propertyName

`string`

The field name that failed validation.

### value

`unknown`

The value that was rejected.

### message?

`string`

An optional custom message from the decorator config.

## Returns

`string`

The formatted error message string.
