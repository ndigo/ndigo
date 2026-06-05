[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / routeMapping

# Function: routeMapping()

> **routeMapping**(`route?`): (`target`, `context`) => `any`

Defined in: packages/blue-dispatcher/src/route-mapping.ts:98

Apply route mapping metadata to a class or method.

Works as both a class and method decorator.

## Parameters

### route?

`string` \| `RouteMappingConfiguration`

The route path or mapping configuration to apply.

## Returns

A decorator function for the target.

(`target`, `context`) => `any`

## Examples

```ts
// Query params — selects only when ?filter=active is present
@routeMapping({ value: '/:id', queryParams: 'filter=active' })
```

```ts
// Matrix params — selects only when ;color=red is in any path segment
@routeMapping({ value: '/:id', matrixParams: 'color=red' })
```
