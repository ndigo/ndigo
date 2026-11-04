[**@ndigo/view-webcomponent v0.0.1**](../README.md)

***

[@ndigo/view-webcomponent](../README.md) / AsNdigoElement

# Function: AsNdigoElement()

> **AsNdigoElement**\<`T`\>(`superclass`): `Constructable`\<[`NdigoElement`](../interfaces/NdigoElement.md)\> & `T`

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

`Constructable`\<[`NdigoElement`](../interfaces/NdigoElement.md)\> & `T`

A subclass that exposes a reflected `name` property.
