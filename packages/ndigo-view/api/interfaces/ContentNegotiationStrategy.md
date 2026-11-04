[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / ContentNegotiationStrategy

# Interface: ContentNegotiationStrategy

Resolves the media types supported for a request.

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Resolves the media types requested by the current request.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

The acceptable media types, in priority order.
