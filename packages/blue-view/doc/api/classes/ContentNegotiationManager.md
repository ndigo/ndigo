[**@blue/view v0.0.1**](../README.md)

***

[@blue/view](../README.md) / ContentNegotiationManager

# Class: ContentNegotiationManager

Aggregates content-negotiation strategies and file-extension resolvers.

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)
- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new ContentNegotiationManager**(`strategies?`): `ContentNegotiationManager`

Creates a manager with the supplied strategies.

#### Parameters

##### strategies?

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[] = `[]`

The strategies to manage.

#### Returns

`ContentNegotiationManager`

## Properties

### resolvers

> **resolvers**: [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)[]

The strategies capable of resolving file extensions.

***

### strategies

> **strategies**: [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)[]

The strategies consulted to resolve media types.

## Methods

### getAllFileExtensions()

> **getAllFileExtensions**(): `string`[]

Returns every file extension known to the registered resolvers.

#### Returns

`string`[]

The union of all extensions from every resolver, deduplicated by insertion order.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextensions)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

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

Resolves the media types requested by the current request.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

Media types in priority order from the first strategy that matches.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
