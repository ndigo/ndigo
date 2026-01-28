[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / BatchLayout

# Interface: BatchLayout

Defined in: packages/blue-logger/src/layout.ts:14

## Extends

- [`Layout`](Layout.md)

## Properties

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layout.ts:9

#### Inherited from

[`Layout`](Layout.md).[`mediaType`](Layout.md#mediatype)

***

### batchFooter

> **batchFooter**: `string`

Defined in: packages/blue-logger/src/layout.ts:15

***

### batchHeader

> **batchHeader**: `string`

Defined in: packages/blue-logger/src/layout.ts:16

***

### batchSeparator

> **batchSeparator**: `string`

Defined in: packages/blue-logger/src/layout.ts:17

## Methods

### format()

> **format**(`entry`): `string`

Defined in: packages/blue-logger/src/layout.ts:11

#### Parameters

##### entry

[`Entry`](../type-aliases/Entry.md)

#### Returns

`string`

#### Inherited from

[`Layout`](Layout.md).[`format`](Layout.md#format)

***

### formatBatch()

> **formatBatch**(`entries`): `string`

Defined in: packages/blue-logger/src/layout.ts:19

#### Parameters

##### entries

[`Entry`](../type-aliases/Entry.md)[]

#### Returns

`string`
