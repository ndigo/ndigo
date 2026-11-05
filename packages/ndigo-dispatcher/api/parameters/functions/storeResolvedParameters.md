[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameters](../README.md) / storeResolvedParameters

# Function: storeResolvedParameters()

> **storeResolvedParameters**(`target`, `propertyKey`, `resolvedParams`): `void`

Register-time hook: store the resolved parameters for a method so
`getMethodParameter` / `hasMethodParameter` (and `RouteHandlerMethod`)
see them.

## Parameters

### target

`unknown`

The class prototype or constructor.

### propertyKey

`string` \| `symbol`

The method name.

### resolvedParams

[`MethodParameter`](../../parameter-types/classes/MethodParameter.md)[]

## Returns

`void`
