[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / requestMapping

# Function: requestMapping()

> **requestMapping**(`route`): (`target`, `context`) => `void`

Apply route mapping metadata with HTTP request semantics to a class or method.

Works as both a class and method decorator, exactly like the `routeMapping` decorator.

## Parameters

### route

`string` \| [`RequestMappingConfiguration`](../interfaces/RequestMappingConfiguration.md)

The route path or mapping configuration.

## Returns

A decorator function for the target.

(`target`, `context`) => `void`

## Examples

```ts
// Any method — equivalent to `routeMapping`('/users')
`requestMapping`('/users')
```

```ts
// GET only
`requestMapping`({ value: '/users', method: 'GET' })
```

```ts
// With the same query/matrix conditions as `routeMapping`
`requestMapping`({ value: '/users/{id}', method: 'DELETE', queryParams: 'filter=all' })
```
