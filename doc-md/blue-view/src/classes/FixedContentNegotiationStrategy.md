[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / FixedContentNegotiationStrategy

# Class: FixedContentNegotiationStrategy

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:135

Returns the same media types for every request.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new FixedContentNegotiationStrategy**(`mediaTypes`): `FixedContentNegotiationStrategy`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:146

Creates a fixed strategy from one or more media types.

#### Parameters

##### mediaTypes

`MediaType` \| `MediaType`[]

The media type or types to return.

#### Returns

`FixedContentNegotiationStrategy`

## Properties

### mediaTypes

> **mediaTypes**: `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:139

The media types this strategy always returns.

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:156

Returns the configured media types.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

The configured media types.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
