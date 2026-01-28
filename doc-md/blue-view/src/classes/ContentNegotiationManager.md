[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationManager

# Class: ContentNegotiationManager

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:100

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)
- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationManager**(`strategies`): `ContentNegotiationManager`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:104

#### Parameters

##### strategies

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[] = `[]`

#### Returns

`ContentNegotiationManager`

## Properties

### strategies

> **strategies**: [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:101

***

### resolvers

> **resolvers**: [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:102

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:112

#### Returns

`string`[]

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:116

#### Parameters

##### mediaType

[`MediaType`](../../../blue-core/src/classes/MediaType.md)

#### Returns

`string`[]

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#resolvefileextensions)

***

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:120

#### Parameters

##### request

`any`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
