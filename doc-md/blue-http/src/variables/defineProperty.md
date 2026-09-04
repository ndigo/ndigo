[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-http/src](../README.md) / defineProperty

# Variable: defineProperty

> **defineProperty**: (`target`, `propertyKey`, `attributes`) => `boolean`

Defined in: packages/blue-http/src/http.ts:271

Adds a property to an object, or modifies attributes of an existing property.

## Parameters

### target

`object`

Object on which to add or modify the property. This can be a native JavaScript object
       (that is, a user-defined object or a built in object) or a DOM object.

### propertyKey

`PropertyKey`

The property name.

### attributes

`PropertyDescriptor` & `ThisType`\<`any`\>

Descriptor for the property. It can be for a data property or an accessor property.

## Returns

`boolean`
