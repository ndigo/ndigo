[**@ndigo/orm v0.0.1**](../../README.md)

***

[@ndigo/orm](../../README.md) / [page](../README.md) / validatePageRequest

# Function: validatePageRequest()

> **validatePageRequest**(`request`, `allowedProperties`): `void`

Validates a page request: positive integer page/size, legal sort
directions, and sort properties restricted to an allowlist (entity column
field names) so backends can interpolate them safely into SQL.

## Parameters

### request

[`PageRequest`](../interfaces/PageRequest.md)

The request to validate.

### allowedProperties

`Set`\<`string`\>

The entity field names sort properties may name.

## Returns

`void`
