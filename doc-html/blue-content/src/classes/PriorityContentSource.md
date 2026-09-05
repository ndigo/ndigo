[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / PriorityContentSource

# Class: PriorityContentSource

Defined in: [packages/blue-content/src/priority.ts:29](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/priority.ts#lines-29)

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

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new PriorityContentSource**(`sources`): `PriorityContentSource`

Defined in: [packages/blue-content/src/priority.ts:39](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/priority.ts#lines-39)

Creates a priority-ordered content source.

#### Parameters

##### sources

[`ContentSource`](../interfaces/ContentSource.md)[]

Sources ordered by priority, highest first.
                 The first source with a non-trivial translation wins.

#### Returns

`PriorityContentSource`

#### Throws

When no sources are provided.

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Defined in: [packages/blue-content/src/priority.ts:57](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/priority.ts#lines-57)

Resolves content by trying each source in priority order.

Returns the first value that differs from the requested key,
meaning a real translation was found. Falls back to the key
itself when no source has a translation.

#### Parameters

##### key

`string`

The content key.

##### language

`string`

The requested language code.

#### Returns

`string`

The translated value from the highest-priority source, or the key.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)
