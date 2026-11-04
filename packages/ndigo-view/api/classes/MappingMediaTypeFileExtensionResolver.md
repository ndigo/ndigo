[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / MappingMediaTypeFileExtensionResolver

# Class: MappingMediaTypeFileExtensionResolver

Resolves file extensions from a map of extension-to-media-type pairs.

## Extended by

- [`AbstractMappingContentNegotiationStrategy`](AbstractMappingContentNegotiationStrategy.md)
- [`PathExtensionContentNegotiationStrategy`](PathExtensionContentNegotiationStrategy.md)

## Implements

- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new MappingMediaTypeFileExtensionResolver**(`mediaTypes`): `MappingMediaTypeFileExtensionResolver`

Creates a resolver from extension-to-media-type mappings.

#### Parameters

##### mediaTypes

`Map`\<`string`, `MediaType`\>

The source map of file extensions to media types.

#### Returns

`MappingMediaTypeFileExtensionResolver`

## Properties

### allFileExtensions

> **allFileExtensions**: `string`[]

All registered file extensions in insertion order.

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

The reverse lookup from media type to file extensions.

***

### mediaTypes

> **mediaTypes**: `Map`\<`string`, `MediaType`\>

The registered media types by normalized file extension.

## Methods

### getAllFileExtensions()

> **getAllFileExtensions**(): `string`[]

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextensions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

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

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#resolvefileextensions)
