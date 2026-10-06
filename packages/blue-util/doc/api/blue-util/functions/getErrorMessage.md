[**@blue/util v0.0.1**](../../README.md)

***

[@blue/util](../../README.md) / [blue-util](../README.md) / getErrorMessage

# Function: getErrorMessage()

> **getErrorMessage**(`error`): `string`

Extracts a human-readable message from an unknown thrown value.

`Error` instances (and subclasses) contribute their `message`; every other
value is coerced with `String(...)`, so catch sites never hand-inline the
`error instanceof Error ? error.message : String(error)` guard.

## Parameters

### error

`unknown`

The unknown thrown value.

## Returns

`string`

The error message as a string.
