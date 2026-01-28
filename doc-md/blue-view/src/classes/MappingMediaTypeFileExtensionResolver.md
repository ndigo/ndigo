[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / MappingMediaTypeFileExtensionResolver

# Class: MappingMediaTypeFileExtensionResolver

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:32

## Extended by

- [`AbstractMappingContentNegotiationStrategy`](AbstractMappingContentNegotiationStrategy.md)

## Implements

- [`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md)

## Constructors

### Constructor

> **new MappingMediaTypeFileExtensionResolver**(`mediaTypes`): `MappingMediaTypeFileExtensionResolver`

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:37

#### Parameters

##### mediaTypes

`Map`\<`string`, [`MediaType`](../../../blue-core/src/classes/MediaType.md)\>

#### Returns

`MappingMediaTypeFileExtensionResolver`

## Properties

### mediaTypes

> **mediaTypes**: `Map`\<`string`, [`MediaType`](../../../blue-core/src/classes/MediaType.md)\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:33

***

### fileExtensions

> **fileExtensions**: [`MultiValueMap`](../../../blue-core/src/classes/MultiValueMap.md)\<[`MediaType`](../../../blue-core/src/classes/MediaType.md), `string`\>

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:34

***

### allFileExtensions

> **allFileExtensions**: `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:35

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:52

#### Returns

`string`[]

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`getAllFileExtenstions`](../interfaces/MediaTypeFileExtensionResolver.md#getallfileextenstions)

***

### getAllMediaTypes()

> **getAllMediaTypes**(): [`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:56

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)[]

***

### lookupMediaType()

> **lookupMediaType**(`extension`): [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:60

#### Parameters

##### extension

`string`

#### Returns

[`MediaType`](../../../blue-core/src/classes/MediaType.md)

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:64

#### Parameters

##### mediaType

[`MediaType`](../../../blue-core/src/classes/MediaType.md)

#### Returns

`string`[]

#### Implementation of

[`MediaTypeFileExtensionResolver`](../interfaces/MediaTypeFileExtensionResolver.md).[`resolveFileExtensions`](../interfaces/MediaTypeFileExtensionResolver.md#resolvefileextensions)
