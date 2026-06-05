[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / MappingMediaTypeFileExtensionResolver

# Class: MappingMediaTypeFileExtensionResolver

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:59

Resolves file extensions from a map of extension-to-media-type pairs.

## Extended by

- [`AbstractMappingContentNegotiationStrategy`](AbstractMappingContentNegotiationStrategy.md)

## Implements

- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new MappingMediaTypeFileExtensionResolver**(`mediaTypes`): `MappingMediaTypeFileExtensionResolver`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:78

Creates a resolver from extension-to-media-type mappings.

#### Parameters

##### mediaTypes

`Map`\<`string`, `MediaType`\>

The source map of file extensions to media types.

#### Returns

`MappingMediaTypeFileExtensionResolver`

## Properties

### mediaTypes

> **mediaTypes**: `Map`\<`string`, `MediaType`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:63

The registered media types by normalized file extension.

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:67

The reverse lookup from media type to file extensions.

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:71

All registered file extensions in insertion order.

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:98

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:107

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

***

### lookupMediaType()

> **lookupMediaType**(`extension`): `MediaType`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:117

Looks up the media type for the given file extension.

#### Parameters

##### extension

`string`

The file extension to resolve.

#### Returns

`MediaType`

The matching media type, or `null` when none exists.

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:127

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
