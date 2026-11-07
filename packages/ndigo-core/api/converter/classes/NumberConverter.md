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

Parses a string as a number.

#### Parameters

##### value

`string`

The numeric string.

#### Returns

`number`

The parsed number (may be `NaN`).

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
