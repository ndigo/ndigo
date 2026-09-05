[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / NumberConverter

# Class: NumberConverter

Defined in: [packages/blue-core/src/converter.ts:185](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-185)

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

Defined in: [packages/blue-core/src/converter.ts:186](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-186)

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`number`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
