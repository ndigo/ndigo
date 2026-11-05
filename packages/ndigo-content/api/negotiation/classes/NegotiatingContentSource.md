[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [negotiation](../README.md) / NegotiatingContentSource

# Class: NegotiatingContentSource

Content source that resolves content using Accept-Language negotiation.

Parses the `Accept-Language` header from a request to determine the preferred
language, then resolves content from a delegate source. This bridges
`@ndigo/content` content sources with HTTP request-level language negotiation.

## Example

```ts
const source = new StaticContentSource({
  title: { en: 'Hello', fr: 'Bonjour' },
});
const negotiator = new NegotiatingContentSource(source, 'en');

negotiator.getContent('title', 'fr-CH, fr;q=0.9, en;q=0.8');
// → 'Bonjour' (resolves fr-CH → fr from the header)

negotiator.getContent('title', 'de');
// → 'Hello' (falls back to default language 'en')
```

## Implements

- [`ContentSource`](../../content/interfaces/ContentSource.md)

## Constructors

### Constructor

> **new NegotiatingContentSource**(`source`, `defaultLanguage?`): `NegotiatingContentSource`

Creates a negotiating content source.

#### Parameters

##### source

[`ContentSource`](../../content/interfaces/ContentSource.md)

The underlying content source providing translations.

##### defaultLanguage?

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md) = `LanguageCodes.EN`

Fallback language when the header cannot be parsed.

#### Returns

`NegotiatingContentSource`

## Accessors

### defaultLanguage

#### Get Signature

> **get** **defaultLanguage**(): `string`

The default language configured for this source.

##### Returns

`string`

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Resolves content using the language from the Accept-Language header.

The `language` parameter is treated as a raw `Accept-Language` header value.
The first language tag is parsed and used for content resolution.
Region subtags (e.g. `fr-CH`) are stripped to the base language (`fr`)
before looking up content.

#### Parameters

##### key

`string`

The content key to resolve.

##### language

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md)

An `Accept-Language` header value or bare language code.

#### Returns

`Promise`\<`string`\>

The translated content, or the key when no translation is found.

#### Implementation of

[`ContentSource`](../../content/interfaces/ContentSource.md).[`getContent`](../../content/interfaces/ContentSource.md#getcontent)
