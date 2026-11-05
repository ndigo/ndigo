[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [error](../README.md) / AsSerializableError

# Function: AsSerializableError()

> **AsSerializableError**\<`T`\>(`superclass`): [`Constructable`](../../constructable/type-aliases/Constructable.md)\<[`Serializable`](../../serializable/interfaces/Serializable.md)\> & `T`

A mixin that adds serialization capabilities to an Error class, allowing it to be converted to a JSON object.

## Type Parameters

### T

`T` *extends* [`Constructable`](../../constructable/type-aliases/Constructable.md)\<`Error`\>

The constructor type of the Error class to extend.

## Parameters

### superclass

`T`

The Error class to extend.

## Returns

[`Constructable`](../../constructable/type-aliases/Constructable.md)\<[`Serializable`](../../serializable/interfaces/Serializable.md)\> & `T`

A new class that is an Error and also `Serializable`.
