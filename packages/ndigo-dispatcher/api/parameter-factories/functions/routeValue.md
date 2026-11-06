[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [parameter-factories](../README.md) / routeValue

# Function: routeValue()

> **routeValue**(`name?`): [`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

Binder for the current `Route` object. Explicit replacement for the
removed implicit route-injection.

The `*Value(name)` contract extracts a value *named* `name` from its
source — so no-argument `routeValue()` binds the whole `Route` (there is
no "route" property to extract), and a named call binds a `Route`
property: `routeValue('path')`, `routeValue('method')`, `routeValue('id')`
(plus framework context stashed in `route.attributes`, matching
`attributeValue`). Available on route/request mappings (the dispatch
unit); not available on sockets.

## Parameters

### name?

`string`

The `Route` property to bind; omit to bind the `Route` itself.

## Returns

[`ParameterExtractor`](../../parameter-types/type-aliases/ParameterExtractor.md)

A route-value extractor.

## Example

```ts
class RouteController {
  @parameters({ route: routeValue() })
  async handle(route: Route) {}
}
```
