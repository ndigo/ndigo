[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameters](../README.md) / parameters

# Function: parameters()

> **parameters**(`paramMap`): (`target`, `context`) => `void`

Invoked via the `parameters` decorator.

Replaces legacy parameter decorators with a method-level decorator.
Uses function parameter name extraction to map extractors to positions.

## Parameters

### paramMap

[`ParameterMap`](../../parameter-types/type-aliases/ParameterMap.md)

The parameter extractors keyed by argument name.

## Returns

The method decorator.

(`target`, `context`) => `void`

## Example

```ts
class PageController {
  @parameters({ page: queryValue('page') })
  handleRequest(page: string) {}
}
```
