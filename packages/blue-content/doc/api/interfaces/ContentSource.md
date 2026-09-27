[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / ContentSource

# Interface: ContentSource

Resolves localized content for a given key and language.

## Extended by

- [`AsyncContentSource`](AsyncContentSource.md)

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Gets translated content for the requested key and language.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`string`

The resolved content string.
