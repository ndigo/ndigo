[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [types](../README.md) / RouteSource

# Type Alias: RouteSource

> **RouteSource** = `RouteRegistry` \| `Iterable`\<\[`string`, `RouteDefinition`\]\> \| `Iterable`\<`RouteDefinition`\> \| `Iterable`\<[`InspectRoute`](../interfaces/InspectRoute.md)\>

A source of declarative routes: a `RouteRegistry`, an iterable of keyed
`[key, RouteDefinition]` entries (the shape `RouteRegistry.entries()`
yields), an iterable of bare `RouteDefinition`s, or explicit
[InspectRoute](../interfaces/InspectRoute.md) descriptors.
