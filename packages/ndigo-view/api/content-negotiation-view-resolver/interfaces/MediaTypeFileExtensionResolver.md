[**@ndigo/view v0.0.1**](../../README.md)

***

[@ndigo/view](../../README.md) / [content-negotiation-view-resolver](../README.md) / MediaTypeFileExtensionResolver

# Interface: MediaTypeFileExtensionResolver

Resolves file extensions for a media type and can enumerate all known extensions.

## Methods

### getAllFileExtensions()

> **getAllFileExtensions**(): `string`[]

Returns every known file extension.

#### Returns

`string`[]

The known file extensions.

***

### resolveFileExtensions()

> **resolveFileExtensions**(`mediaType`): `string`[]

Resolves the file extensions associated with the given media type.

#### Parameters

##### mediaType

`MediaType`

The media type to resolve.

#### Returns

`string`[]

The matching file extensions.
