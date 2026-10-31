[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / parameters

# Function: parameters()

> **parameters**(`paramMap`): (`target`, `context`) => `void`

Invoked via the `parameters` decorator.

Replaces legacy parameter decorators with a method-level decorator.
Uses function parameter name extraction to map extractors to positions.

## Parameters

### paramMap

[`ParameterMap`](../type-aliases/ParameterMap.md)

## Returns

(`target`, `context`) => `void`

## Example

```ts
// Old (legacy - not supported in TC39):
handleRequest(@queryValue('page') page: string) {}

// New (TC39):
`parameters`({
  page: queryValue('page')
})
handleRequest(page: string) {}
```
