[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

---

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / CompletingTransformer

# Interface: CompletingTransformer\<TResult, TComplete, TInput\>

Defined in: packages/blue-core/src/transducer.ts:14

## Type Parameters

### TResult

`TResult`

### TComplete

`TComplete`

### TInput

`TInput`

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `TResult`

Defined in: packages/blue-core/src/transducer.ts:15

#### Returns

`TResult`

---

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `TComplete`

Defined in: packages/blue-core/src/transducer.ts:16

#### Parameters

##### result

`TResult`

#### Returns

`TComplete`

---

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`TResult`\>

Defined in: packages/blue-core/src/transducer.ts:17

#### Parameters

##### result

`TResult`

##### input

`TInput`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`TResult`\>
