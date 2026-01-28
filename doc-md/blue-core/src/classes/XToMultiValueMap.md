[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / XToMultiValueMap

# Class: XToMultiValueMap\<T, K, V\>

Defined in: packages/blue-core/src/transducer.ts:166

## Type Parameters

### T

`T`

### K

`K`

### V

`V`

## Implements

- [`Transformer`](../type-aliases/Transformer.md)\<[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>, `T`\>

## Constructors

### Constructor

> **new XToMultiValueMap**\<`T`, `K`, `V`\>(`getKey`, `getValue`): `XToMultiValueMap`\<`T`, `K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:170

#### Parameters

##### getKey

(`item`) => `K`

##### getValue

(`item`) => `V`

#### Returns

`XToMultiValueMap`\<`T`, `K`, `V`\>

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): [`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:185

#### Returns

[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

#### Implementation of

`Transformer.@@transducer/init`

***

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): [`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

Defined in: packages/blue-core/src/transducer.ts:189

#### Parameters

##### result

[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

#### Returns

[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

#### Implementation of

`Transformer.@@transducer/result`

***

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>\>

Defined in: packages/blue-core/src/transducer.ts:193

#### Parameters

##### result

[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>

##### input

`T`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<[`MultiValueMap`](MultiValueMap.md)\<`K`, `V`\>\>

#### Implementation of

`Transformer.@@transducer/step`
