[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [routes](../README.md) / collectRoutes

# Function: collectRoutes()

> **collectRoutes**(`source?`): [`InspectRoute`](../../types/interfaces/InspectRoute.md)[]

Enumerate the routes a source declares.

The emitted `name` is input-shape independent for the same controller: a
`RouteRegistry` and an iterable of its `entries()` both contribute the dotted
registry key, and explicit descriptors contribute their `name`. Only a bare
iterable of `RouteDefinition`s (no key supplied) falls back to
`deriveKey(pattern)`. The result is de-duplicated and sorted by name, then
path, so the manifest is deterministic regardless of registration order.

## Parameters

### source?

[`RouteSource`](../../types/type-aliases/RouteSource.md)

The route source, or `undefined` for no routes.

## Returns

[`InspectRoute`](../../types/interfaces/InspectRoute.md)[]

The sorted route rows.
