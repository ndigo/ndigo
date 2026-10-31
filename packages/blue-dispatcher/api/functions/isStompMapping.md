[**@blue/dispatcher v0.0.1**](../README.md)

***

[@blue/dispatcher](../README.md) / isStompMapping

# Function: isStompMapping()

> **isStompMapping**(`target`, `propertyKey`): `boolean`

Whether the given method is a STOMP endpoint.

A stomp-marked method always carries the socket markers too (the
`stompMapping` decorator delegates to `socketMapping`), so this is the
distinguishing probe for protocol negotiation — it should be consulted
only for methods that already `isSocketMapping`.

## Parameters

### target

`unknown`

The class constructor or prototype to inspect.

### propertyKey

`string` \| `symbol`

The method name.

## Returns

`boolean`

`true` when the method is stomp-mapped.
