[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [converter](../README.md) / ArrayConverter

# Class: ArrayConverter

Converts strings to arrays by splitting on a separator.

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `string`[]\>

## Constructors

### Constructor

> **new ArrayConverter**(): `ArrayConverter`

#### Returns

`ArrayConverter`

## Methods

### convert()

> **convert**(`value`, `separator?`): `string`[]

Splits a string into an array.

#### Parameters

##### value

`string`

The string to split.

##### separator?

`string` \| `RegExp` = `','`

Split separator (default `','`).

#### Returns

`string`[]

The resulting array.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
