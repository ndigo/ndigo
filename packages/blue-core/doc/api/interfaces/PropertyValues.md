[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / PropertyValues

# Interface: PropertyValues

A collection that can look up property values by name.

## Extends

- `Iterable`\<[`PropertyValue`](../classes/PropertyValue.md)\>

## Properties

### propertyValues

> `readonly` **propertyValues**: [`PropertyValue`](../classes/PropertyValue.md)[]

All property values in iteration order.

## Methods

### getPropertyValue()

> **getPropertyValue**(`propertyName`): [`PropertyValue`](../classes/PropertyValue.md) \| `null`

Returns the property value for the given name.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

[`PropertyValue`](../classes/PropertyValue.md) \| `null`

The matching property value, or `null` when no match exists.
