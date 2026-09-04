[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-view-webcomponent/src](../README.md) / AsBlueElement

# Function: AsBlueElement()

> **AsBlueElement**\<`T`\>(`superclass`): `Constructable`\<[`BlueElement`](../interfaces/BlueElement.md)\> & `T`

Defined in: packages/blue-view-webcomponent/src/blue-element.ts:22

Adds a `name` property that reflects the element's `name` attribute.

Use this mixin when a web component should expose a simple attribute-backed identifier
without re-implementing the reflection logic in each subclass.

## Type Parameters

### T

`T` *extends* `Constructable`\<`HTMLElement`\>

## Parameters

### superclass

`T`

The base HTMLElement subclass to extend.

## Returns

`Constructable`\<[`BlueElement`](../interfaces/BlueElement.md)\> & `T`

A subclass that exposes a reflected `name` property.
