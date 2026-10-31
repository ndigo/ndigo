[**@blue/flags v0.0.1**](../README.md)

***

[@blue/flags](../README.md) / validateFlagKey

# Function: validateFlagKey()

> **validateFlagKey**(`flag`, `where?`): `void`

Validates a flag key — used at decoration time (fail loud at
definition) and by providers at evaluation time.

## Parameters

### flag

`string`

The flag key to validate.

### where?

`string` = `'feature flag'`

Call-site label for the error message.

## Returns

`void`

## Throws

When the key is not a non-empty identifier string.
