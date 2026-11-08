[**@ndigo/openapi v0.0.1**](../../README.md)

***

[@ndigo/openapi](../../README.md) / [spec](../README.md) / RouteMappingTable

# Interface: RouteMappingTable

What the generator needs from a handler mapping: the registered route
table. `RadixMetadataHandlerMapping` (and any
`AbstractHandlerMethodMapping`) satisfies it structurally.

## Methods

### getHandlerMethods()

> **getHandlerMethods**(): `Map`\<`RouteMappingInfo`, `RouteHandlerMethod`\>

The registered route table: route info → handler method.

#### Returns

`Map`\<`RouteMappingInfo`, `RouteHandlerMethod`\>

The mapping's handler methods.
