[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / NullLayout

# Class: NullLayout

Defined in: packages/blue-logger/src/layouts/null-layout.ts:8

## Extends

- [`AbstractBatchLayout`](AbstractBatchLayout.md)

## Extended by

- [`JSONLayout`](JSONLayout.md)
- [`XMLLayout`](XMLLayout.md)
- [`HTTPPostLayout`](../../../blue-dispatcher/src/classes/HTTPPostLayout.md)

## Constructors

### Constructor

> **new NullLayout**(): `NullLayout`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:11

#### Returns

`NullLayout`

#### Overrides

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`constructor`](AbstractBatchLayout.md#constructor)

## Properties

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layout.ts:23

#### Inherited from

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`mediaType`](AbstractBatchLayout.md#mediatype)

***

### batchFooter

> **batchFooter**: `string`

Defined in: packages/blue-logger/src/layout.ts:33

#### Inherited from

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`batchFooter`](AbstractBatchLayout.md#batchfooter)

***

### batchHeader

> **batchHeader**: `string`

Defined in: packages/blue-logger/src/layout.ts:34

#### Inherited from

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`batchHeader`](AbstractBatchLayout.md#batchheader)

***

### batchSeparator

> **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:9

#### Overrides

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`batchSeparator`](AbstractBatchLayout.md#batchseparator)

## Methods

### format()

> **format**(`entry`): `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:22

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Overrides

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`format`](AbstractBatchLayout.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layouts/null-layout.ts:26

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`

#### Overrides

[`AbstractBatchLayout`](AbstractBatchLayout.md).[`formatBatch`](AbstractBatchLayout.md#formatbatch)

***

### formatEntries()

> `protected` **formatEntries**(`entries`): `string`[]

Defined in: packages/blue-logger/src/layouts/null-layout.ts:31

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`[]
