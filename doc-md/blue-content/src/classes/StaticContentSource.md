[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / StaticContentSource

# Class: StaticContentSource

Defined in: packages/blue-content/src/content.ts:31

In-memory content source with language fallback support.

## Implements

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new StaticContentSource**(`content?`, `defaultLanguage?`): `StaticContentSource`

Defined in: packages/blue-content/src/content.ts:41

Creates an in-memory content source.

#### Parameters

##### content?

[`ContentDictionary`](../type-aliases/ContentDictionary.md) = `{}`

Localized content keyed by content id and language.

##### defaultLanguage?

`string` = `'en'`

Fallback language used when a translation is missing.

#### Returns

`StaticContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: packages/blue-content/src/content.ts:53

Resolves content with a language fallback to the default language and then the key itself.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string`

The requested language code.

#### Returns

`string`

The localized content or the key when no translation exists.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)

***

### hasContent()

> **hasContent**(`key`, `language`): `boolean`

Defined in: packages/blue-content/src/content.ts:74

Checks whether content exists for the requested key in the given language or default language.

#### Parameters

##### key

`string`

The content key to look up.

##### language

`string`

The requested language code.

#### Returns

`boolean`

`true` when a translation is available.
