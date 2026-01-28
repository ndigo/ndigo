[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / AbstractMappingContentNegotiationStrategy

# Abstract Class: AbstractMappingContentNegotiationStrategy

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:81

## Extends

- [`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md)

## Implements

- [`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md)

## Constructors

### Constructor

> **new AbstractMappingContentNegotiationStrategy**(`mediaTypes`): `AbstractMappingContentNegotiationStrategy`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:37

#### Parameters

##### mediaTypes

`Map`\<`string`, [`MediaType`](../../../blue-core/src/classes/MediaType.md)\>

#### Returns

`AbstractMappingContentNegotiationStrategy`

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`constructor`](MappingMediaTypeFileExtensionResolver.md#constructor)

## Properties

### mediaTypes

> **mediaTypes**: `Map`\<`string`, [`MediaType`](../../../blue-core/src/classes/MediaType.md)\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:33

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`mediaTypes`](MappingMediaTypeFileExtensionResolver.md#mediatypes)

***

### fileExtensions

> **fileExtensions**: [`MultiValueMap`](../../../blue-core/src/classes/MultiValueMap.md)\<[`MediaType`](../../../blue-core/src/classes/MediaType.md), `string`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:34

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`fileExtensions`](MappingMediaTypeFileExtensionResolver.md#fileextensions)

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:35

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`allFileExtensions`](MappingMediaTypeFileExtensionResolver.md#allfileextensions)

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:52

#### Returns

`string`[]

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](MappingMediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:56

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`getAllMediaTypes`](MappingMediaTypeFileExtensionResolver.md#getallmediatypes)

***

### lookupMediaType()

> **lookupMediaType**(`extension`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:60

#### Parameters

##### extension

`string`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`lookupMediaType`](MappingMediaTypeFileExtensionResolver.md#lookupmediatype)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:64

#### Parameters

##### mediaType

[`MediaType`](../../../blue-core/src/classes/MediaType.md)

#### Returns

`string`[]

#### Inherited from

[`MappingMediaTypeFileExtensionResolver`](MappingMediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](MappingMediaTypeFileExtensionResolver.md#resolvefileextensions)

***

### resolveMediaTypes()

> **resolveMediaTypes**(`request`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:85

#### Parameters

##### request

`any`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

#### Implementation of

[`ContentNegotiationStrategy`](../interfaces/ContentNegotiationStrategy.md).[`resolveMediaTypes`](../interfaces/ContentNegotiationStrategy.md#resolvemediatypes)

***

### resolveMediaTypeKey()

> **resolveMediaTypeKey**(`request`, `key`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:89

#### Parameters

##### request

`any`

##### key

`string`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]
