[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [interceptor](../README.md) / MethodDescriptor

# Interface: MethodDescriptor

Static description of one managed method, shared by all of its calls.

## Extended by

- [`MethodInvocation`](MethodInvocation.md)

## Properties

### entryName

> `readonly` **entryName**: `string`

The container entry name the instance was created under
(e.g. `'orderService'`).

***

### methodName

> `readonly` **methodName**: `PropertyKey`

The method name (string; symbols are not intercepted).

***

### targetType

> `readonly` **targetType**: `Function`

The class the method was resolved from — the factory's instance type.

## Methods

### annotation()

> **annotation**\<`T`\>(`key`): `T` \| `undefined`

Reads the annotation value stored on this method by
`methodAnnotation(...)`, walking the class hierarchy (nearest
declaration wins). `undefined` when the method carries none.

#### Type Parameters

##### T

`T`

#### Parameters

##### key

[`AnnotationKey`](../../annotation/interfaces/AnnotationKey.md)\<`T`\>

The annotation handle to read.

#### Returns

`T` \| `undefined`

The annotation value, or `undefined` when the method carries none.
