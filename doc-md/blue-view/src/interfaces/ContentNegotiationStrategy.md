[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationStrategy

# Interface: ContentNegotiationStrategy

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:33

Resolves the media types supported for a request.

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:40

Resolves the media types requested by the current request.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

The acceptable media types, in priority order.
