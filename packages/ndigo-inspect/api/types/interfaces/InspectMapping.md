[**@ndigo/inspect v0.0.1**](../../README.md)

***

[@ndigo/inspect](../../README.md) / [types](../README.md) / InspectMapping

# Interface: InspectMapping

A registered handler mapping: the pattern it claims, the HTTP methods it
accepts, and the handler method it resolves to. Values are never emitted.

## Properties

### handler

> **handler**: [`InspectHandler`](InspectHandler.md)

The resolved handler class + method.

***

### httpMethods?

> `optional` **httpMethods?**: `string`[]

The accepted HTTP methods; omitted when the mapping matches any method.

***

### parameters?

> `optional` **parameters?**: [`InspectParameter`](InspectParameter.md)[]

The handler method's parameters and their binding sources, when declared.

***

### pattern

> **pattern**: `string`

The route pattern the mapping claims.

***

### socket?

> `optional` **socket?**: `boolean`

`true` when the mapping is a WebSocket endpoint.
