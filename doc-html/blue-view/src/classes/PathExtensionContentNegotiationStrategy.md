[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / PathExtensionContentNegotiationStrategy

# Class: PathExtensionContentNegotiationStrategy

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:207](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-207)

Content negotiation strategy that is intended to derive media types from the request path extension.

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new PathExtensionContentNegotiationStrategy**(`mediaTypes`): `PathExtensionContentNegotiationStrategy`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-81)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:66](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-66)

The registered media types by normalized file extension.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`mediaTypes`](MappingMediaTypeFileExtensionResolver.md#mediatypes)

***

### fileExtensions

> **fileExtensions**: `MultiValueMap`\<`MediaType`, `string`\>

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:70](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-70)

The reverse lookup from media type to file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`fileExtensions`](MappingMediaTypeFileExtensionResolver.md#fileextensions)

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:74](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-74)

All registered file extensions in insertion order.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`allFileExtensions`](MappingMediaTypeFileExtensionResolver.md#allfileextensions)

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:101](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-101)

Returns all known file extensions.

#### Returns

`string`[]

The known file extensions.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](MappingMediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): `MediaType`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:110](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-110)

Returns all media types known to this resolver.

#### Returns

`MediaType`[]

The known media types.

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllMediaTypes`](MappingMediaTypeFileExtensionResolver.md#getallmediatypes)

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

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`lookupMediaType`](MappingMediaTypeFileExtensionResolver.md#lookupmediatype)

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

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](MappingMediaTypeFileExtensionResolver.md#resolvefileextensions)

***

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): `MediaType`[]

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:217](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-217)

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
