[**@ndigo/orm v0.0.1**](../README.md)

***

[@ndigo/orm](../README.md) / toAsyncRepository

# Function: toAsyncRepository()

> **toAsyncRepository**\<`T`, `ID`\>(`repository`): [`AsyncRepository`](../interfaces/AsyncRepository.md)\<`T`, `ID`\>

Adapts a synchronous repository to [AsyncRepository](../interfaces/AsyncRepository.md) without changing its
behavior. Calls retain the repository receiver, and synchronous exceptions
become promise rejections. Async repositories cannot be adapted back to sync.

## Type Parameters

### T

`T` *extends* `object`

### ID

`ID`

## Parameters

### repository

[`Repository`](../interfaces/Repository.md)\<`T`, `ID`\>

## Returns

[`AsyncRepository`](../interfaces/AsyncRepository.md)\<`T`, `ID`\>
