[**@ndigo/http v0.0.1**](../../README.md)

***

[@ndigo/http](../../README.md) / [like-response](../README.md) / likeResponse

# Function: likeResponse()

> **likeResponse**(`value`): `value is Response`

Tests whether a value behaves like a `Response`.

The check accepts real `Response` instances and compatible response-shaped
objects so interceptors can work across environments.

## Parameters

### value

`unknown`

The value to test.

## Returns

`value is Response`

`true` when the value matches the `Response` shape.
