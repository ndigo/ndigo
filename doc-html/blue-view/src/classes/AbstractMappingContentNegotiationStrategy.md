[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractMappingContentNegotiationStrategy

# Abstract Class: AbstractMappingContentNegotiationStrategy

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:167](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-167)

Base class for content negotiation strategies that also resolve file extensions.

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new AbstractMappingContentNegotiationStrategy**(`mediaTypes`): `AbstractMappingContentNegotiationStrategy`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:81](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-81)

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

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:177](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-177)

Resolves the media types for a request.

#### Parameters

##### request

`any`

The current request.

#### Returns

`MediaType`[]

Media types from this resolver, optionally filtered by request params.

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)

***

### resolveMediaTypeKey()

> **resolveMediaTypeKey**(`request`, `key`): `MediaType`[] \| `null`

Defined in: [packages/blue-view/src/content-negotiation-view-resolver.ts:199](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-view/src/content-negotiation-view-resolver.ts#lines-199)

Resolves media types for a specific key within the request.

#### Parameters

##### request

`any`

The current request.

##### key

`string`

The request key to inspect.

#### Returns

`MediaType`[] \| `null`

The matching media types, or `null` when none are found.
