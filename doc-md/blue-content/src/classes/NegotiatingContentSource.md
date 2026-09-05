[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / NegotiatingContentSource

# Class: NegotiatingContentSource

Defined in: [packages/blue-content/src/negotiation.ts:44](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/negotiation.ts#lines-44)

Content source that resolves content using Accept-Language negotiation.

Parses the `Accept-Language` header from a request to determine the preferred
language, then resolves content from a delegate source. This bridges
`@blue/content` content sources with HTTP request-level language negotiation.

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

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new NegotiatingContentSource**(`source`, `defaultLanguage?`): `NegotiatingContentSource`

Defined in: [packages/blue-content/src/negotiation.ts:54](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/negotiation.ts#lines-54)

Creates a negotiating content source.

#### Parameters

##### source

[`ContentSource`](../interfaces/ContentSource.md)

The underlying content source providing translations.

##### defaultLanguage?

`string` = `'en'`

Fallback language when the header cannot be parsed.

#### Returns

`NegotiatingContentSource`

## Accessors

### defaultLanguage

#### Get Signature

> **get** **defaultLanguage**(): `string`

Defined in: [packages/blue-content/src/negotiation.ts:99](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/negotiation.ts#lines-99)

The default language configured for this source.

##### Returns

`string`

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-content/src/negotiation.ts:71](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/negotiation.ts#lines-71)

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

`string`

An `Accept-Language` header value or bare language code.

#### Returns

`string`

The translated content, or the key when no translation is found.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)
