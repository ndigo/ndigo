[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XToArray

# Class: XToArray\<T\>

Defined in: packages/blue-core/src/transducer.ts:109

## Type Parameters

### T

`T` = `any`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<`T`[], `T`\>

## Constructors

### Constructor

> **new XToArray**\<`T`\>(): `XToArray`\<`T`\>

#### Returns

`XToArray`\<`T`\>

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `T`[]

Defined in: packages/blue-core/src/transducer.ts:110

#### Returns

`T`[]

#### Implementation of

`Transformer.@@transducer/init`

---

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `T`[]

Defined in: packages/blue-core/src/transducer.ts:114

#### Parameters

##### result

`T`[]

#### Returns

`T`[]

#### Implementation of

`Transformer.@@transducer/result`

---

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`T`[]\>

Defined in: packages/blue-core/src/transducer.ts:118

#### Parameters

##### result

`T`[]

##### input

`T`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`T`[]\>

#### Implementation of

`Transformer.@@transducer/step`
