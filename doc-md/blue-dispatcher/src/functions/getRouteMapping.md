[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / getRouteMapping

# Function: getRouteMapping()

> **getRouteMapping**(`target`, `propertyKey?`): [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md) \| `undefined`

Defined in: [packages/blue-dispatcher/src/route-mapping.ts:71](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-mapping.ts#lines-71)

Get route mapping metadata from a class or method.

## Parameters

### target

`any`

The class constructor or prototype to inspect.

### propertyKey?

`string` \| `symbol`

The method name, when reading method-level metadata.

## Returns

[`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md) \| `undefined`

The stored route mapping, or `undefined`.
