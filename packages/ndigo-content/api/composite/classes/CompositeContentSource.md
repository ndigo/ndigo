[**@ndigo/content v0.0.1**](../../README.md)

***

[@ndigo/content](../../README.md) / [composite](../README.md) / CompositeContentSource

# Class: CompositeContentSource

Merges multiple content sources in priority order.

`getContent` tries each source in order and returns the first result that
is not identical to the requested key (i.e. a real translation was found).
Falls back to the key itself when all sources return the key unchanged.

## Implements

- [`ContentSource`](../../content/interfaces/ContentSource.md)

## Constructors

### Constructor

> **new CompositeContentSource**(`sources`): `CompositeContentSource`

Creates a composite content source.

#### Parameters

##### sources

[`ContentSource`](../../content/interfaces/ContentSource.md)[]

Sources ordered by priority, highest first.

#### Returns

`CompositeContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `Promise`\<`string`\>

Resolves the first real translation across all sources.

#### Parameters

##### key

`string`

The content key.

##### language

`string` \| [`LanguageCode`](../../language-code/classes/LanguageCode.md)

The requested language code.

#### Returns

`Promise`\<`string`\>

The first translated value, or the key when none is found.

#### Implementation of

[`ContentSource`](../../content/interfaces/ContentSource.md).[`getContent`](../../content/interfaces/ContentSource.md#getcontent)
