[**@ndigo/dispatcher v0.0.1**](../README.md)

***

[@ndigo/dispatcher](../README.md) / resolveParameters

# Function: resolveParameters()

> **resolveParameters**(`target`, `propertyKey`, `handlerMethod`): [`MethodParameter`](../classes/MethodParameter.md)[]

Convert a raw `@parameters` map into the positional [MethodParameter](../classes/MethodParameter.md)
array the dispatch pipeline + socket resolution consume, validating the
map against the method and its mapping kind.

- `route`/`request`: each key must be a method-signature argument name;
  the resulting array is indexed by argument position.
- `socket`: no signature mapping — each declared parameter is resolved
  from the upgrade sources into `session.params` (keyed by extractor
  name); the array is in declaration order.

Throws `InvalidParameterMappingError` when a `*Value` extractor has no
source for the mapping kind (e.g. `bodyValue` on a socket mapping), or when
the map omits an argument between two declared ones (positional dispatch
cannot skip a slot: the undeclared argument would be invoked as
`undefined`). Arguments after the last mapped one may stay undeclared.

## Parameters

### target

`unknown`

The class prototype or constructor.

### propertyKey

`string` \| `symbol`

The method name.

### handlerMethod

`Function`

The method function (for signature discovery).

## Returns

[`MethodParameter`](../classes/MethodParameter.md)[]

The converted parameters (may be the empty array).

## Throws

On source/kind incompatibility or a sparse positional map.
