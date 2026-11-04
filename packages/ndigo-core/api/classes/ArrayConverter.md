[**@ndigo/core v0.0.1**](../README.md)

***

[@ndigo/core](../README.md) / ArrayConverter

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

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

##### separator?

`string` \| `RegExp` = `','`

#### Returns

`string`[]

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
