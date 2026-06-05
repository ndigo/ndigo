[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / likeErrorHandler

# Function: likeErrorHandler()

> **likeErrorHandler**(`target`): `boolean`

Defined in: packages/blue-dispatcher/src/error-mapping.ts:104

Checks if a given target object or its constructor is an error handler.
An object is considered an error handler if it has the `@errorHandler` metadata
or if its constructor has the `@errorHandler` metadata.

## Parameters

### target

`any`

The object to check.

## Returns

`boolean`

`true` if the target or its constructor is an error handler, `false` otherwise.
