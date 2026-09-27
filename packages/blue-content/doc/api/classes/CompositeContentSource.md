[**@blue/content v0.0.1**](../README.md)

***

[@blue/content](../README.md) / CompositeContentSource

# Class: CompositeContentSource

Merges multiple content sources in priority order.

`getContent` tries each source in order and returns the first result that
is not identical to the requested key (i.e. a real translation was found).
Falls back to the key itself when all sources return the key unchanged.

## Implements

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new CompositeContentSource**(`sources`): `CompositeContentSource`

Creates a composite content source.

#### Parameters

##### sources

[`ContentSource`](../interfaces/ContentSource.md)[]

Sources ordered by priority, highest first.

#### Returns

`CompositeContentSource`

## Methods

### getContent()

> **getContent**(`key`, `language`): `string`

Resolves the first real translation across all sources.

#### Parameters

##### key

`string`

The content key.

##### language

`string`

The requested language code.

#### Returns

`string`

The first translated value, or the key when none is found.

#### Implementation of

[`ContentSource`](../interfaces/ContentSource.md).[`getContent`](../interfaces/ContentSource.md#getcontent)
