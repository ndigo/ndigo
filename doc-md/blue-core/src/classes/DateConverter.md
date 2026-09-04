[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / DateConverter

# Class: DateConverter

Defined in: packages/blue-core/src/converter.ts:154

Converts strings to `Date` instances.

Accepts any input that `new Date()` accepts (ISO 8601, timestamps, relative dates).
Validates the date is actually valid (not a normalized invalid date like Feb 29 in non-leap years).

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `Date`\>

## Constructors

### Constructor

> **new DateConverter**(): `DateConverter`

#### Returns

`DateConverter`

## Methods

### convert()

> **convert**(`value`): `Date`

Defined in: packages/blue-core/src/converter.ts:155

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`Date`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
