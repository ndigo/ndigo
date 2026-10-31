[**@blue/core v0.0.1**](../README.md)

***

[@blue/core](../README.md) / BooleanConverter

# Class: BooleanConverter

Converts strings to booleans using common truthy/falsy conventions.

Truthy values (case-insensitive): `true`, `1`, `yes`, `on`
Falsy values (case-insensitive): `false`, `0`, `no`, `off`

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `boolean`\>

## Constructors

### Constructor

> **new BooleanConverter**(): `BooleanConverter`

#### Returns

`BooleanConverter`

## Methods

### convert()

> **convert**(`value`): `boolean`

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`boolean`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
