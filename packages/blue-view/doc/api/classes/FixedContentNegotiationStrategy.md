[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / FixedContentNegotiationStrategy

# Class: FixedContentNegotiationStrategy

Returns the same media types for every request.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new FixedContentNegotiationStrategy**(`mediaTypes`): `FixedContentNegotiationStrategy`

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

The media types this strategy always returns.

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Returns the configured media types.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

The configured media types.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
