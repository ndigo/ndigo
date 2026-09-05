[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / CompositeContentSource

# Class: CompositeContentSource

Defined in: [packages/blue-content/src/composite.ts:15](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-15)

Merges multiple content sources in priority order.

`getContent` tries each source in order and returns the first result that
is not identical to the requested key (i.e. a real translation was found).
Falls back to the key itself when all sources return the key unchanged.

## Implements

- [`ContentSource`](../interfaces/ContentSource.md)

## Constructors

### Constructor

> **new CompositeContentSource**(`sources`): `CompositeContentSource`

Defined in: [packages/blue-content/src/composite.ts:23](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-23)

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

Defined in: [packages/blue-content/src/composite.ts:37](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-content/src/composite.ts#lines-37)

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
