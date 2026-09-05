[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / requestMapping

# Function: requestMapping()

> **requestMapping**(`route`): (`target`, `context`) => `any`

Defined in: [packages/blue-dispatcher/src/request-mapping.ts:47](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/request-mapping.ts#lines-47)

Apply route mapping metadata with HTTP request semantics to a class or method.

Works as both a class and method decorator, exactly like the `routeMapping` decorator.

## Parameters

### route

`string` \| [`RequestMappingConfiguration`](../interfaces/RequestMappingConfiguration.md)

The route path or mapping configuration.

## Returns

A decorator function for the target.

(`target`, `context`) => `any`

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
