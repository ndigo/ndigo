[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / ArrayConverter

# Class: ArrayConverter

Defined in: packages/blue-core/src/converter.ts:221

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

Defined in: packages/blue-core/src/converter.ts:222

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

##### separator?

`string` \| `RegExp`

#### Returns

`string`[]

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
