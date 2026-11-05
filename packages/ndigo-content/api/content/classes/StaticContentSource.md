[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [content](../README.md) / StaticContentSource

# Class: StaticContentSource

In-memory content source with language fallback support.

## Implements

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new StaticContentSource**(`content?`, `defaultLanguage?`): `StaticContentSource`

Creates an in-memory content source.

#### Parameters

##### content?

[`ContentDictionary`](../type-aliases/ContentDictionary.md) = `{}`

Localized content keyed by content id and language.

##### defaultLanguage?

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md) = `LanguageCodes.EN`

Fallback language used when a translation is missing.

#### Returns

`StaticContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Resolves content with a language fallback to the default language and then the key itself.

Async by contract (see [ContentSource](../interfaces/ContentSource.md)); the lookup itself is
synchronous, so the promise resolves on the next microtask.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md)

The requested language code.

#### Returns

`Promise`\<`string`\>

The localized content or the key when no translation exists.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)

***

### hasContent()

> **hasContent**(`key`, `language`): `boolean`

Checks whether content exists for the requested key in the given language or default language.

#### Parameters

##### key

`string`

The content key to look up.

##### language

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md)

The requested language code.

#### Returns

`boolean`

`true` when a translation is available.
