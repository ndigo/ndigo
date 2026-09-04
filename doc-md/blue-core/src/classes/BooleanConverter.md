[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / BooleanConverter

# Class: BooleanConverter

Defined in: packages/blue-core/src/converter.ts:197

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

Defined in: packages/blue-core/src/converter.ts:198

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`boolean`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
