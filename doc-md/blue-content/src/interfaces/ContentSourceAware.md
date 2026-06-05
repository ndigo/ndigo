[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-content/src](../README.md) / ContentSourceAware

# Interface: ContentSourceAware

Defined in: packages/blue-content/src/content.ts:83

Marks an object that can receive a content source.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

Defined in: packages/blue-factory/lib/aware.d.ts:21

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Defined in: packages/blue-content/src/content.ts:89

Sets the content source used by the receiver.

#### Parameters

##### contentSource

[`ContentSource`](ContentSource.md)

The content source to attach.

#### Returns

`void`
