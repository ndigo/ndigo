[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / getDispatchError

# Function: getDispatchError()

> **getDispatchError**(`route`): `Error` \| `null`

Reads the swallowed dispatch failure recorded on the route, if any.

## Parameters

### route

[`Route`](#)

The route the dispatch was processing.

## Returns

`Error` \| `null`

The recorded error, or `null` when dispatch completed
  without an unhandled failure.
