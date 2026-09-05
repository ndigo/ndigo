[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / ContentSource

# Interface: ContentSource

Defined in: [packages/blue-content/src/content.ts:12](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/content.ts#lines-12)

Resolves localized content for a given key and language.

## Extended by

- [`AsyncContentSource`](AsyncContentSource.md)

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-content/src/content.ts:20](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/content.ts#lines-20)

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
