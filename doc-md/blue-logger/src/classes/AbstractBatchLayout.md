[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AbstractBatchLayout

# Abstract Class: AbstractBatchLayout

Defined in: packages/blue-logger/src/layout.ts:32

## Extends

- [`AbstractLayout`](AbstractLayout.md)

## Extended by

- [`NullLayout`](NullLayout.md)

## Implements

- [`BatchLayout`](../interfaces/BatchLayout.md)

## Constructors

### Constructor

> **new AbstractBatchLayout**(): `AbstractBatchLayout`

Defined in: packages/blue-logger/src/layout.ts:37

#### Returns

`AbstractBatchLayout`

#### Overrides

[`AbstractLayout`](AbstractLayout.md).[`constructor`](AbstractLayout.md#constructor)

## Properties

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layout.ts:23

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`mediaType`](../interfaces/BatchLayout.md#mediatype)

#### Inherited from

[`AbstractLayout`](AbstractLayout.md).[`mediaType`](AbstractLayout.md#mediatype)

***

### batchFooter

> **batchFooter**: `string`

Defined in: packages/blue-logger/src/layout.ts:33

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`batchFooter`](../interfaces/BatchLayout.md#batchfooter)

***

### batchHeader

> **batchHeader**: `string`

Defined in: packages/blue-logger/src/layout.ts:34

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`batchHeader`](../interfaces/BatchLayout.md#batchheader)

***

### batchSeparator

> **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layout.ts:35

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`batchSeparator`](../interfaces/BatchLayout.md#batchseparator)

## Methods

### format()

> `abstract` **format**(`entry`): `string`

Defined in: packages/blue-logger/src/layout.ts:29

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`format`](../interfaces/BatchLayout.md#format)

#### Inherited from

[`AbstractLayout`](AbstractLayout.md).[`format`](AbstractLayout.md#format)

***

### formatBatch()

> `abstract` **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layout.ts:44

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`

#### Implementation of

[`BatchLayout`](../interfaces/BatchLayout.md).[`formatBatch`](../interfaces/BatchLayout.md#formatbatch)
