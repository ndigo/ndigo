[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / routeMapping

# Function: routeMapping()

> **routeMapping**(`route?`): (`target`, `context`) => `void`

Apply route mapping metadata to a class or method.

Works as both a class and method decorator.

## Parameters

### route?

`string` \| [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md)

The route path or mapping configuration to apply.

## Returns

A decorator function for the target.

(`target`, `context`) => `void`

## Examples

```ts
// Query params — selects only when ?filter=active is present
`routeMapping`({ value: '/:id', queryParams: 'filter=active' })
```

```ts
// Matrix params — selects only when ;color=red is in any path segment
`routeMapping`({ value: '/:id', matrixParams: 'color=red' })
```
