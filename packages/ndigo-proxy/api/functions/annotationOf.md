[**@ndigo/proxy v0.0.1**](../README.md)

***

[@ndigo/proxy](../README.md) / annotationOf

# Function: annotationOf()

> **annotationOf**\<`T`\>(`target`, `key`, `methodName`): `T` \| `undefined`

Reads an annotation value for a method, walking the class hierarchy so
inherited annotations resolve (nearest declaration wins).

## Type Parameters

### T

`T`

## Parameters

### target

`unknown`

Class constructor or instance.

### key

[`AnnotationKey`](../interfaces/AnnotationKey.md)\<`T`\>

The [AnnotationKey](../interfaces/AnnotationKey.md) the value was stored under.

### methodName

`PropertyKey`

The method to look up.

## Returns

`T` \| `undefined`

The annotation value, or `undefined` when the method carries none.
