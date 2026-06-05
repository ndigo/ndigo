[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / PathExtensionContentNegotiationStrategy

# Class: PathExtensionContentNegotiationStrategy

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:194

Content negotiation strategy that is intended to derive media types from the request path extension.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new PathExtensionContentNegotiationStrategy**(): `PathExtensionContentNegotiationStrategy`

#### Returns

`PathExtensionContentNegotiationStrategy`

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:202

Resolves the media types requested by the current request.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

Never returns normally.

#### Throws

Always thrown because the strategy is not implemented yet.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
