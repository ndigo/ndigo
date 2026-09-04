[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / PathExtensionContentNegotiationStrategy

# Class: PathExtensionContentNegotiationStrategy

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:204

Content negotiation strategy that is intended to derive media types from the request path extension.

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new PathExtensionContentNegotiationStrategy**(`mediaTypes`): `PathExtensionContentNegotiationStrategy`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:78

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

### mediaTypes

> **mediaTypes**: `Map`\<`string`, `MediaType`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:63

The registered media types by normalized file extension.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`mediaTypes`](MappingMediaTypeFileExtensionResolver.md#mediatypes)

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:67

The reverse lookup from media type to file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`fileExtensions`](MappingMediaTypeFileExtensionResolver.md#fileextensions)

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:71

All registered file extensions in insertion order.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`allFileExtensions`](MappingMediaTypeFileExtensionResolver.md#allfileextensions)

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:98

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](MappingMediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:107

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllMediaTypes`](MappingMediaTypeFileExtensionResolver.md#getallmediatypes)

***

### lookupMediaType()

> **lookupMediaType**(`extension`): `MediaType` \| `null`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:117

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

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:127

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

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:213

Resolves media types by inspecting the request path extension.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

Media types matching the file extension extracted from the path.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)
