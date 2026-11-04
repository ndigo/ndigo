[**@ndigo/router v0.0.1**](../README.md)

***

[@ndigo/router](../README.md) / applyNegotiatedLanguage

# Function: applyNegotiatedLanguage()

> **applyNegotiatedLanguage**(`route`, `language`): `void`

Records the negotiated request language on the route.

Dispatchers call this after negotiation so views and templates can format
consistently for the request. No-op on attribute-less routes (partial
hand-rolled routes, test doubles).

## Parameters

### route

[`Route`](../interfaces/Route.md)

The current route.

### language

`string`

The resolved language tag.

## Returns

`void`
