[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XToRecord

# Class: XToRecord\<T, U\>

Defined in: packages/blue-core/src/transducer.ts:204

## Type Parameters

### T

`T`

### U

`U`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<`Record`\<`string`, `U`\>, `T`\>

## Constructors

### Constructor

> **new XToRecord**\<`T`, `U`\>(`getKey`, `getValue`): `XToRecord`\<`T`, `U`\>

Defined in: packages/blue-core/src/transducer.ts:208

#### Parameters

##### getKey

(`item`) => `string`

##### getValue

(`item`) => `U`

#### Returns

`XToRecord`\<`T`, `U`\>

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `Record`\<`string`, `U`\>

Defined in: packages/blue-core/src/transducer.ts:223

#### Returns

`Record`\<`string`, `U`\>

#### Implementation of

`Transformer.@@transducer/init`

---

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `Record`\<`string`, `U`\>

Defined in: packages/blue-core/src/transducer.ts:227

#### Parameters

##### result

`Record`\<`string`, `U`\>

#### Returns

`Record`\<`string`, `U`\>

#### Implementation of

`Transformer.@@transducer/result`

---

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Record`\<`string`, `U`\>\>

Defined in: packages/blue-core/src/transducer.ts:231

#### Parameters

##### result

`Record`\<`string`, `U`\>

##### input

`T`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`Record`\<`string`, `U`\>\>

#### Implementation of

`Transformer.@@transducer/step`
