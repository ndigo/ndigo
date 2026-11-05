[**@ndigo/dispatcher v0.0.1**](../../README.md)

***

[@ndigo/dispatcher](../../README.md) / [stomp-mapping](../README.md) / stompMapping

# Function: stompMapping()

> **stompMapping**(`route`): (`target`, `context`) => `void`

Marks a method as a STOMP endpoint at the given path.

Implies `@socketMapping` (the connection is a WebSocket); handlers
receive a `SocketSession` and typically hand it to a `StompBroker`
(e.g. `await broker.handleSocket(session)`).

## Parameters

### route

`string` \| [`RouteMappingConfiguration`](../../route-mapping/type-aliases/RouteMappingConfiguration.md)

The path to serve STOMP connections at, relative to any
  class-level mapping, or a full mapping configuration.

## Returns

A method decorator.

(`target`, `context`) => `void`
