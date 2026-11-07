[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [converter](../README.md) / JSONConverter

# Class: JSONConverter

Converts strings to parsed JSON values via `JSON.parse`.

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `unknown`\>

## Constructors

### Constructor

> **new JSONConverter**(): `JSONConverter`

#### Returns

`JSONConverter`

## Methods

### convert()

> **convert**(`value`): `unknown`

Parses a string as JSON.

#### Parameters

##### value

`string`

The JSON string.

#### Returns

`unknown`

The parsed value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
