[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [dispatcher](../README.md) / setDispatchError

# Function: setDispatchError()

> **setDispatchError**(`route`, `error`): `void`

Records a swallowed dispatch failure on the route (DSV-B1).

## Parameters

### route

[`Route`](#)

The route the dispatch was processing.

### error

`Error`

The error that remained unhandled after `completeHandle`.

## Returns

`void`
