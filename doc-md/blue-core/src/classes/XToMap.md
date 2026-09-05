[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XToMap

# Class: XToMap\<T, K, V\>

Defined in: packages/blue-core/src/transducer.ts:128

## Type Parameters

### T

`T`

### K

`K`

### V

`V`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<`Map`\<`K`, `V`\>, `T`\>

## Constructors

### Constructor

> **new XToMap**\<`T`, `K`, `V`\>(`getKey`, `getValue`): `XToMap`\<`T`, `K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:132

#### Parameters

##### getKey

(`item`) => `K`

##### getValue

(`item`) => `V`

#### Returns

`XToMap`\<`T`, `K`, `V`\>

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `Map`\<`K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:147

#### Returns

`Map`\<`K`, `V`\>

#### Implementation of

`Transformer.@@transducer/init`

---

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `Map`\<`K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:151

#### Parameters

##### result

`Map`\<`K`, `V`\>

#### Returns

`Map`\<`K`, `V`\>

#### Implementation of

`Transformer.@@transducer/result`

---

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Map`\<`K`, `V`\>\>

Defined in: packages/blue-core/src/transducer.ts:155

#### Parameters

##### result

`Map`\<`K`, `V`\>

##### input

`T`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Map`\<`K`, `V`\>\>

#### Implementation of

`Transformer.@@transducer/step`
