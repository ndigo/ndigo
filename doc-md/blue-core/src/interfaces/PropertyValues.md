[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / PropertyValues

# Interface: PropertyValues

Defined in: packages/blue-core/src/property-value.ts:14

A collection that can look up property values by name.

## Extends

- `Iterable`\<[`PropertyValue`](../classes/PropertyValue.md)\>

## Properties

### propertyValues

> `readonly` **propertyValues**: [`PropertyValue`](../classes/PropertyValue.md)[]

Defined in: packages/blue-core/src/property-value.ts:16

All property values in iteration order.

## Methods

### getPropertyValue()

> **getPropertyValue**(`propertyName`): [`PropertyValue`](../classes/PropertyValue.md)

Defined in: packages/blue-core/src/property-value.ts:24

Returns the property value for the given name.

#### Parameters

##### propertyName

`string`

Property name to resolve.

#### Returns

[`PropertyValue`](../classes/PropertyValue.md)

The matching property value, or `null` when no match exists.
