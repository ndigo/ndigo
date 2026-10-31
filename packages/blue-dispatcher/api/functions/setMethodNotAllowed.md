[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / setMethodNotAllowed

# Function: setMethodNotAllowed()

> **setMethodNotAllowed**(`route`, `allow`): `void`

Records a method-mismatch on the route: the path exists but the request
method is not among the handlers' allowed methods.

## Parameters

### route

[`Route`](#)

The route being resolved.

### allow

`string`

The `Allow` header value (comma-separated methods).

## Returns

`void`
