[**@ndigo/proxy v0.0.1**](../../README.md)

***

[@ndigo/proxy](../../README.md) / [interceptor](../README.md) / MethodInvocation

# Interface: MethodInvocation

One intercepted call: the [MethodDescriptor](MethodDescriptor.md) plus the receiver and
actual arguments for this invocation.

## Extends

- [`MethodDescriptor`](MethodDescriptor.md)

## Properties

### args

> `readonly` **args**: readonly `unknown`[]

The arguments of this call.

***

### entryName

> `readonly` **entryName**: `string`

The container entry name the instance was created under
(e.g. `'orderService'`).

#### Inherited from

[`MethodDescriptor`](MethodDescriptor.md).[`entryName`](MethodDescriptor.md#entryname)

***

### methodName

> `readonly` **methodName**: `PropertyKey`

The method name (string; symbols are not intercepted).

#### Inherited from

[`MethodDescriptor`](MethodDescriptor.md).[`methodName`](MethodDescriptor.md#methodname)

***

### target

> `readonly` **target**: `object`

The real instance the method executes on — always the proxy target,
never the proxy itself, so `#private` fields keep working.

***

### targetType

> `readonly` **targetType**: `Function`

The class the method was resolved from — the factory's instance type.

#### Inherited from

[`MethodDescriptor`](MethodDescriptor.md).[`targetType`](MethodDescriptor.md#targettype)

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

#### Returns

`T` \| `undefined`

#### Inherited from

[`MethodDescriptor`](MethodDescriptor.md).[`annotation`](MethodDescriptor.md#annotation)
