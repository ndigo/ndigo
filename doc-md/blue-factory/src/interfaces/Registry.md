[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-factory/src](../README.md) / Registry

# Interface: Registry

Defined in: packages/blue-factory/src/registry.ts:7

## Extended by

- [`ConfigurableFactory`](ConfigurableFactory.md)

## Methods

### destroyValue()

> **destroyValue**(`name`): `void`

Defined in: packages/blue-factory/src/registry.ts:8

#### Parameters

##### name

`string`

#### Returns

`void`

***

### getValue()

> **getValue**\<`T`\>(`name`): `T`

Defined in: packages/blue-factory/src/registry.ts:9

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

#### Returns

`T`

***

### hasValue()

> **hasValue**(`name`): `boolean`

Defined in: packages/blue-factory/src/registry.ts:10

#### Parameters

##### name

`string`

#### Returns

`boolean`

***

### setValue()

> **setValue**\<`T`\>(`name`, `value`): `void`

Defined in: packages/blue-factory/src/registry.ts:11

#### Type Parameters

##### T

`T` = `any`

#### Parameters

##### name

`string`

##### value

`T`

#### Returns

`void`
