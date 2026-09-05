[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / FixedContentNegotiationStrategy

# Class: FixedContentNegotiationStrategy

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:138](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-138)

Returns the same media types for every request.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new FixedContentNegotiationStrategy**(`mediaTypes`): `FixedContentNegotiationStrategy`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:149](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-149)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:142](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-142)

The media types this strategy always returns.

## Methods

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:159](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-159)

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
