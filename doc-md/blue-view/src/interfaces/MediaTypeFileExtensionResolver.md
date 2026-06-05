[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view/src](../README.md) / MediaTypeFileExtensionResolver

# Interface: MediaTypeFileExtensionResolver

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:13

Resolves file extensions for a media type and can enumerate all known extensions.

## Methods

### getAllFileExtenstions()

> **getAllFileExtenstions**(): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:19

Returns every known file extension.

#### Returns

`string`[]

The known file extensions.

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Defined in: packages/blue-view/src/content-negotiation-view-resolver.ts:27

Resolves the file extensions associated with the given media type.

#### Parameters

##### mediaType

`MediaType`

The media type to resolve.

#### Returns

`string`[]

The matching file extensions.
