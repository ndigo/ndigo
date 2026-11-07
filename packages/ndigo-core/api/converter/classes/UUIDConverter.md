[**@ndigo/core v0.0.1**](../../README.md)

***

[@ndigo/core](../../README.md) / [converter](../README.md) / UUIDConverter

# Class: UUIDConverter

Converts string values to lowercase UUID strings (validation + normalization).

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `string`\>

## Constructors

### Constructor

> **new UUIDConverter**(): `UUIDConverter`

#### Returns

`UUIDConverter`

## Methods

### convert()

> **convert**(`value`): `string`

Converts a string to a normalized lowercase UUID.

#### Parameters

##### value

`string`

The UUID string to normalize.

#### Returns

`string`

The normalized UUID.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
