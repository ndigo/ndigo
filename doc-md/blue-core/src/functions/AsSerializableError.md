[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / AsSerializableError

# Function: AsSerializableError()

> **AsSerializableError**\<`T`\>(`superclass`): [`Constructable`](../type-aliases/Constructable.md)\<[`Serializable`](../interfaces/Serializable.md)\> & `T`

Defined in: packages/blue-core/src/error.ts:17

A mixin that adds serialization capabilities to an Error class, allowing it to be converted to a JSON object.

## Type Parameters

### T

`T` *extends* [`Constructable`](../type-aliases/Constructable.md)\<`Error`\>

The constructor type of the Error class to extend.

## Parameters

### superclass

`T`

The Error class to extend.

## Returns

[`Constructable`](../type-aliases/Constructable.md)\<[`Serializable`](../interfaces/Serializable.md)\> & `T`

A new class that is an Error and also `Serializable`.
