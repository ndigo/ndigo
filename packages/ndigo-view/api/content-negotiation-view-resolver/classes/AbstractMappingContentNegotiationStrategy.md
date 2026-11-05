[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [content-negotiation-view-resolver](../README.md) / AbstractMappingContentNegotiationStrategy

# Abstract Class: AbstractMappingContentNegotiationStrategy

Base class for content negotiation strategies that also resolve file extensions.

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new AbstractMappingContentNegotiationStrategy**(`mediaTypes`): `AbstractMappingContentNegotiationStrategy`

Creates a resolver from extension-to-media-type mappings.

#### Parameters

##### mediaTypes

`Map`\<`string`, `MediaType`\>

The source map of file extensions to media types.

#### Returns

`AbstractMappingContentNegotiationStrategy`

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`constructor`](MappingMediaTypeFileExtensionResolver.md#constructor)

## Properties

### allFileExtensions

> **allFileExtensions**: `string`[]

All registered file extensions in insertion order.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`allFileExtensions`](MappingMediaTypeFileExtensionResolver.md#allfileextensions)

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

The reverse lookup from media type to file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`fileExtensions`](MappingMediaTypeFileExtensionResolver.md#fileextensions)

***

### mediaTypes

> **mediaTypes**: `Map`\<`string`, `MediaType`\>

The registered media types by normalized file extension.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`mediaTypes`](MappingMediaTypeFileExtensionResolver.md#mediatypes)

## Methods

### getAllFileExtensions()

> **getAllFileExtensions**(): `string`[]

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllFileExtensions`](MappingMediaTypeFileExtensionResolver.md#getallfileextensions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllMediaTypes`](MappingMediaTypeFileExtensionResolver.md#getallmediatypes)

***

### lookupMediaType()

> **lookupMediaType**(`extension`): `MediaType` \| `null`

Looks up the media type for the given file extension.

#### Parameters

##### extension

`string`

The file extension to resolve.

#### Returns

`MediaType` \| `null`

The matching media type, or `null` when none exists.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`lookupMediaType`](MappingMediaTypeFileExtensionResolver.md#lookupmediatype)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Returns the file extensions associated with the given media type.

#### Parameters

##### mediaType

`MediaType`

The media type to resolve.

#### Returns

`string`[]

The matching file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](MappingMediaTypeFileExtensionResolver.md#resolvefileextensions)

***

### resolveMediaTypeKey()

> **resolveMediaTypeKey**(`request`, `key`): `MediaType`[] \| `null`

Resolves media types for a specific key within the request.

#### Parameters

##### request

`unknown`

The current request.

##### key

`string`

The request key to inspect.

#### Returns

`MediaType`[] \| `null`

The matching media types, or `null` when none are found.

***

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Resolves the media types for a request.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

Media types from this resolver, optionally filtered by request params.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
