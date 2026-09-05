[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XToSet

# Class: XToSet\<T\>

Defined in: packages/blue-core/src/transducer.ts:242

## Type Parameters

### T

`T`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<`Set`\<`T`\>, `T`\>

## Constructors

### Constructor

> **new XToSet**\<`T`\>(`set`): `XToSet`\<`T`\>

Defined in: packages/blue-core/src/transducer.ts:245

#### Parameters

##### set

`Set`\<`T`\> = `...`

#### Returns

`XToSet`\<`T`\>

## Properties

### set

> `readonly` **set**: `Set`\<`T`\>

Defined in: packages/blue-core/src/transducer.ts:243

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `Set`\<`T`\>

Defined in: packages/blue-core/src/transducer.ts:249

#### Returns

`Set`\<`T`\>

#### Implementation of

`Transformer.@@transducer/init`

---

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `Set`\<`T`\>

Defined in: packages/blue-core/src/transducer.ts:253

#### Parameters

##### result

`Set`\<`T`\>

#### Returns

`Set`\<`T`\>

#### Implementation of

`Transformer.@@transducer/result`

---

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Set`\<`T`\>\>

Defined in: packages/blue-core/src/transducer.ts:257

#### Parameters

##### result

`Set`\<`T`\>

##### input

`T`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Set`\<`T`\>\>

#### Implementation of

`Transformer.@@transducer/step`
