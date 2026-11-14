[**@ndigo/router v0.0.1**](../../README.md)

***

[@ndigo/router](../../README.md) / [route-attributes](../README.md) / applyNegotiatedTheme

# Function: applyNegotiatedTheme()

> **applyNegotiatedTheme**(`route`, `theme`): `void`

Records the negotiated request theme on the route.

Dispatchers call this after negotiation so views and server-rendered shells
can select the matching visual theme. No-op on attribute-less routes
(partial hand-rolled routes, test doubles).

## Parameters

### route

[`Route`](../../route/interfaces/Route.md)

The current route.

### theme

`string`

The resolved theme name.

## Returns

`void`
