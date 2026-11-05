[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [factory-shared](../README.md) / deleteProperty

# Variable: deleteProperty

> **deleteProperty**: (`target`, `propertyKey`) => `boolean`

Removes a property from an object, equivalent to `delete target[propertyKey]`,
except it won't throw if `target[propertyKey]` is non-configurable.

## Parameters

### target

`object`

Object from which to remove the own property.

### propertyKey

`PropertyKey`

The property name.

## Returns

`boolean`
