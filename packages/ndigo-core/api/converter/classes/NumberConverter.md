[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [converter](../README.md) / NumberConverter

# Class: NumberConverter

Converts strings to numbers via `parseFloat`.

Returns `NaN` for non-numeric input — callers should check with `Number.isFinite()`.

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `number`\>

## Constructors

### Constructor

> **new NumberConverter**(): `NumberConverter`

#### Returns

`NumberConverter`

## Methods

### convert()

> **convert**(`value`): `number`

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`number`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
