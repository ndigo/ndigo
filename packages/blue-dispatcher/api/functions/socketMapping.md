[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / socketMapping

# Function: socketMapping()

> **socketMapping**(`route`): (`target`, `context`) => `void`

Marks a method as a WebSocket endpoint at the given path.

## Parameters

### route

`string` \| [`RouteMappingConfiguration`](../type-aliases/RouteMappingConfiguration.md)

The path to serve WebSocket connections at, relative to any
  class-level mapping, or a full mapping configuration.

## Returns

A method decorator.

(`target`, `context`) => `void`
