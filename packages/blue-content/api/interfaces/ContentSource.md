[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / ContentSource

# Interface: ContentSource

Resolves localized content for a given key and language.

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Gets translated content for the requested key and language.

Methods are async by default; implementations may be synchronous
under the hood. Resolves to the content string, or the key itself
when no translation exists.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string` \| [`LanguageCode`](../classes/LanguageCode.md)

The requested language code.

#### Returns

`Promise`\<`string`\>

A promise of the resolved content string.
