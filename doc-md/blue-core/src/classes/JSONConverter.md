[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / JSONConverter

# Class: JSONConverter

Defined in: [packages/blue-core/src/converter.ts:170](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-170)

Converts strings to parsed JSON values via `JSON.parse`.

## Implements

- [`Converter`](../interfaces/Converter.md)\<`string`, `any`\>

## Constructors

### Constructor

> **new JSONConverter**(): `JSONConverter`

#### Returns

`JSONConverter`

## Methods

### convert()

> **convert**(`value`): `any`

Defined in: [packages/blue-core/src/converter.ts:171](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-core/src/converter.ts#lines-171)

Converts a value of type `S` to type `T`.

#### Parameters

##### value

`string`

#### Returns

`any`

The converted target value.

#### Implementation of

[`Converter`](../interfaces/Converter.md).[`convert`](../interfaces/Converter.md#convert)
