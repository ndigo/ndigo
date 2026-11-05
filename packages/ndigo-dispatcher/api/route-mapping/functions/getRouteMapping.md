[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [route-mapping](../README.md) / getRouteMapping

# Function: getRouteMapping()

> **getRouteMapping**(`target`, `propertyKey?`): [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md) \| `undefined`

Get route mapping metadata from a class or method.

## Parameters

### target

`unknown`

The class constructor or prototype to inspect.

### propertyKey?

`string` \| `symbol`

The method name, when reading method-level metadata.

## Returns

[`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md) \| `undefined`

The stored route mapping, or `undefined`.
