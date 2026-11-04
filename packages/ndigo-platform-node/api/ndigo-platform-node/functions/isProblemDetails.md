[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [ndigo-platform-node](../README.md) / isProblemDetails

# Function: isProblemDetails()

> **isProblemDetails**(`value`): `value is ProblemDetails`

Whether a value already IS a problem document (has an HTTP status), so the
response-entity renderer does not double-wrap framework-produced problems.

## Parameters

### value

`unknown`

The response body.

## Returns

`value is ProblemDetails`

`true` when the value is a problem document.
