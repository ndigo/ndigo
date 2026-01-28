[**BlueJS Framework v3.0.0-alpha.0**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-core/src](../README.md) / DelegatingTransformer

# Class: DelegatingTransformer\<TResult, TComplete, TInput\>

Defined in: packages/blue-core/src/transducer.ts:36

## Type Parameters

### TResult

`TResult`

### TComplete

`TComplete`

### TInput

`TInput`

## Implements

- [`CompletingTransformer`](../interfaces/CompletingTransformer.md)\<`TResult`, `TComplete`, `TInput`\>

## Constructors

### Constructor

> **new DelegatingTransformer**\<`TResult`, `TComplete`, `TInput`\>(`xf`): `DelegatingTransformer`\<`TResult`, `TComplete`, `TInput`\>

Defined in: packages/blue-core/src/transducer.ts:41

#### Parameters

##### xf

[`CompletingTransformer`](../interfaces/CompletingTransformer.md)\<`TResult`, `TComplete`, `TInput`\>

#### Returns

`DelegatingTransformer`\<`TResult`, `TComplete`, `TInput`\>

## Properties

### xf

> `readonly` **xf**: [`CompletingTransformer`](../interfaces/CompletingTransformer.md)\<`TResult`, `TComplete`, `TInput`\>

Defined in: packages/blue-core/src/transducer.ts:39

## Methods

### @@transducer/init()?

> `optional` **@@transducer/init**(): `TResult`

Defined in: packages/blue-core/src/transducer.ts:50

#### Returns

`TResult`

#### Implementation of

[`CompletingTransformer`](../interfaces/CompletingTransformer.md).[`@@transducer/init`](../interfaces/CompletingTransformer.md#transducerinit)

***

### @@transducer/result()?

> `optional` **@@transducer/result**(`result`): `TComplete`

Defined in: packages/blue-core/src/transducer.ts:54

#### Parameters

##### result

`TResult`

#### Returns

`TComplete`

#### Implementation of

[`CompletingTransformer`](../interfaces/CompletingTransformer.md).[`@@transducer/result`](../interfaces/CompletingTransformer.md#transducerresult)

***

### @@transducer/step()

> **@@transducer/step**(`result`, `input`): [`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`TResult`\>

Defined in: packages/blue-core/src/transducer.ts:58

#### Parameters

##### result

`TResult`

##### input

`TInput`

#### Returns

[`MaybeReduced`](../type-aliases/MaybeReduced.md)\<`TResult`\>

#### Implementation of

[`CompletingTransformer`](../interfaces/CompletingTransformer.md).[`@@transducer/step`](../interfaces/CompletingTransformer.md#transducerstep)
