[**@ndigo/factory v0.0.1**](../../README.md)

***

[@ndigo/factory](../../README.md) / [aware](../README.md) / AsAware

# Function: AsAware()

> **AsAware**\<`T`\>(`superclass`): [`Constructable`](#)\<[`Aware`](../interfaces/Aware.md)\> & `T`

Mixin marking a class as aware: adds a `true` value under the `Aware` symbol
key so the factory can recognise aware instances without a concrete
interface.

## Type Parameters

### T

`T` *extends* [`Constructable`](#)\<\{ \}\>

## Parameters

### superclass

`T`

## Returns

[`Constructable`](#)\<[`Aware`](../interfaces/Aware.md)\> & `T`
