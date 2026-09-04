[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / routeParams

# Function: routeParams()

> **routeParams**(`paramMap`): (`target`, `context`) => `void`

Defined in: packages/blue-dispatcher/src/route-parameter.ts:485

## Parameters

### paramMap

[`RouteParameterMap`](../type-aliases/RouteParameterMap.md)

## Returns

(`target`, `context`) => `void`

## Route Params

decorator - Maps parameter names to extractors

Replaces legacy parameter decorators with a method-level decorator.
Uses function parameter name extraction to map extractors to positions.

## Example

```ts
// Old (legacy - not supported in TC39):
handleRequest(@queryValue('page') page: string) {}

// New (TC39):
@routeParams({
  page: queryValue('page')
})
handleRequest(page: string) {}
```
