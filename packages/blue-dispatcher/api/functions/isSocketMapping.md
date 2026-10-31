[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / isSocketMapping

# Function: isSocketMapping()

> **isSocketMapping**(`target`, `propertyKey`): `boolean`

Whether the given method is a WebSocket endpoint.

`@socketMapping` writes a `route:socket:<method>` marker into the shared
`Symbol.metadata` record alongside the method's `route:mapping:<name>`
entry, so a method is a socket endpoint when both are present.

## Parameters

### target

`unknown`

The class constructor or prototype to inspect.

### propertyKey

`string` \| `symbol`

The method name.

## Returns

`boolean`

`true` when the method is socket-mapped.
