[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-dispatcher/src](../README.md) / routeParams

# Function: routeParams()

> **routeParams**(`paramMap`): (`target`, `context`) => `void`

Defined in: [packages/blue-dispatcher/src/route-parameter.ts:459](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-dispatcher/src/route-parameter.ts#lines-459)

Invoked via the `routeParams` decorator.

Replaces legacy parameter decorators with a method-level decorator.
Uses function parameter name extraction to map extractors to positions.

## Parameters

### paramMap

[`RouteParameterMap`](../type-aliases/RouteParameterMap.md)

## Returns

(`target`, `context`) => `void`

## Example

```ts
// Old (legacy - not supported in TC39):
handleRequest(@queryValue('page') page: string) {}

// New (TC39):
`routeParams`({
  page: queryValue('page')
})
handleRequest(page: string) {}
```
