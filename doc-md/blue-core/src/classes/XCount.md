[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XCount

# Class: XCount\<T\>

Defined in: packages/blue-core/src/transducer.ts:91

## Type Parameters

### T

`T` = `any`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<`number`, `T`\>

## Constructors

### Constructor

> **new XCount**\<`T`\>(): `XCount`\<`T`\>

#### Returns

`XCount`\<`T`\>

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `number`

Defined in: packages/blue-core/src/transducer.ts:92

#### Returns

`number`

#### Implementation of

`Transformer.@@transducer/init`

***

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `number`

Defined in: packages/blue-core/src/transducer.ts:96

#### Parameters

##### result

`number`

#### Returns

`number`

#### Implementation of

`Transformer.@@transducer/result`

***

### @@transducer/step()

> **@@transducer/step**(`result`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`number`\>

Defined in: packages/blue-core/src/transducer.ts:100

#### Parameters

##### result

`number`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`number`\>

#### Implementation of

`Transformer.@@transducer/step`
