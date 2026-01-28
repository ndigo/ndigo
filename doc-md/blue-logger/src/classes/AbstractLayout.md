[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-logger/src](../README.md) / AbstractLayout

# Abstract Class: AbstractLayout

Defined in: packages/blue-logger/src/layout.ts:22

## Extended by

- [`AbstractBatchLayout`](AbstractBatchLayout.md)
- [`PatternLayout`](PatternLayout.md)

## Implements

- [`Layout`](../interfaces/Layout.md)

## Constructors

### Constructor

> **new AbstractLayout**(): `AbstractLayout`

Defined in: packages/blue-logger/src/layout.ts:25

#### Returns

`AbstractLayout`

## Properties

### mediaType

> **mediaType**: [`MediaType`](../../../blue-core/src/classes/MediaType.md)

Defined in: packages/blue-logger/src/layout.ts:23

#### Implementation of

[`Layout`](../interfaces/Layout.md).[`mediaType`](../interfaces/Layout.md#mediatype)

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

[`Layout`](../interfaces/Layout.md).[`format`](../interfaces/Layout.md#format)
