[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [priority](../README.md) / PriorityContentSource

# Class: PriorityContentSource

Content source that merges multiple sources in priority order.

Higher-priority sources override values from lower-priority sources.
This enables theme composition — a base theme provides defaults and
an overriding theme only needs to supply the values it changes.

## Example

```ts
const base = new StaticContentSource({
  title: { en: 'My App', fr: 'Mon App' },
  tagline: { en: 'Welcome', fr: 'Bienvenue' },
});
const override = new StaticContentSource({
  tagline: { en: 'Hello!' },
});

const merged = new PriorityContentSource([override, base]);
merged.getContent('title', 'en');  // 'My App'  (from base)
merged.getContent('tagline', 'en'); // 'Hello!'  (from override)
```

## Implements

- [`ContentSource`](../../content/interfaces/ContentSource.md)

## Constructors

### Constructor

> **new PriorityContentSource**(`sources`): `PriorityContentSource`

Creates a priority-ordered content source.

#### Parameters

##### sources

[`ContentSource`](../../content/interfaces/ContentSource.md)[]

Sources ordered by priority, highest first.
                 The first source with a non-trivial translation wins.

#### Returns

`PriorityContentSource`

#### Throws

When no sources are provided.

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Resolves content by trying each source in priority order.

Returns the first value that differs from the requested key,
meaning a real translation was found. Falls back to the key
itself when no source has a translation.

#### Parameters

##### key

`string`

The content key.

##### language

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md)

The requested language code.

#### Returns

`Promise`\<`string`\>

The translated value from the highest-priority source, or the key.

#### Implementation of

[`ContentSource`](../../content/interfaces/ContentSource.md).[`getContent`](../../content/interfaces/ContentSource.md#getcontent)
