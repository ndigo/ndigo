[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / PathExtensionContentNegotiationStrategy

# Class: PathExtensionContentNegotiationStrategy

Content negotiation strategy that is intended to derive media types from the request path extension.

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new PathExtensionContentNegotiationStrategy**(`mediaTypes`): `PathExtensionContentNegotiationStrategy`

Creates a resolver from extension-to-media-type mappings.

#### Parameters

##### mediaTypes

`Map`\<`string`, `MediaType`\>

The source map of file extensions to media types.

#### Returns

`PathExtensionContentNegotiationStrategy`

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

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Resolves media types by inspecting the request path extension.

#### Parameters

##### request

`unknown`

The current request.

#### Returns

`MediaType`[]

Media types matching the file extension extracted from the path.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
