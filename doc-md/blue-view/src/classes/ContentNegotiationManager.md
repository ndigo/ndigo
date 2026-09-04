[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / ContentNegotiationManager

# Class: ContentNegotiationManager

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:231

Aggregates content-negotiation strategies and file-extension resolvers.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)
- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationManager**(`strategies?`): `ContentNegotiationManager`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:246

Creates a manager with the supplied strategies.

#### Parameters

##### strategies?

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[] = `[]`

The strategies to manage.

#### Returns

`ContentNegotiationManager`

## Properties

### strategies

> **strategies**: [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:235

The strategies consulted to resolve media types.

***

### resolvers

> **resolvers**: [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:239

The strategies capable of resolving file extensions.

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:259

Returns every file extension known to the registered resolvers.

#### Returns

`string`[]

The union of all extensions from every resolver, deduplicated by insertion order.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:280

Resolves file extensions for the given media type.

#### Parameters

##### mediaType

`MediaType`

The media type to resolve.

#### Returns

`string`[]

Extensions from the first resolver that supports this media type, or empty array.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#resolvefileextensions)

***

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:295

Resolves the media types requested by the current request.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

Media types in priority order from the first strategy that matches.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
