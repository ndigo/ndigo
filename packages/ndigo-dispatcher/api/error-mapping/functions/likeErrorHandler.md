[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [error-mapping](../README.md) / likeErrorHandler

# Function: likeErrorHandler()

> **likeErrorHandler**(`target`): `boolean`

Checks if a given target object or its constructor is an error handler.
An object is considered an error handler if it has the the `errorHandler` decorator metadata
or if its constructor has the the `errorHandler` decorator metadata.

## Parameters

### target

`unknown`

The object to check.

## Returns

`boolean`

`true` if the target or its constructor is an error handler, `false` otherwise.
