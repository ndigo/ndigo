[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / MappingMediaTypeFileExtensionResolver

# Class: MappingMediaTypeFileExtensionResolver

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:62](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-62)

Resolves file extensions from a map of extension-to-media-type pairs.

## Extended by

- [`AbstractMappingContentNegotiationStrategy`](AbstractMappingContentNegotiationStrategy.md)
- [`PathExtensionContentNegotiationStrategy`](PathExtensionContentNegotiationStrategy.md)

## Implements

- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new MappingMediaTypeFileExtensionResolver**(`mediaTypes`): `MappingMediaTypeFileExtensionResolver`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-81)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-66)

The registered media types by normalized file extension.

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-70)

The reverse lookup from media type to file extensions.

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-74)

All registered file extensions in insertion order.

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-101)

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-110)

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

***

### lookupMediaType()

> **lookupMediaType**(`extension`): `MediaType` \| `null`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:120](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-120)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:130](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-130)

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
