[**@ndigo/content v0.0.1**](../README.md)

***

[@ndigo/content](../README.md) / ContentSourceAware

# Interface: ContentSourceAware

Marks an object that can receive a content source.

## Extends

- `Aware`

## Properties

### \[$aware\]

> `readonly` **\[$aware\]**: `boolean`

A symbol indicating that the value is aware.

#### Inherited from

`Aware.[$aware]`

## Methods

### setContentSource()

> **setContentSource**(`contentSource`): `void`

Sets the content source used by the receiver.

#### Parameters

##### contentSource

[`ContentSource`](ContentSource.md)

The content source to attach.

#### Returns

`void`
