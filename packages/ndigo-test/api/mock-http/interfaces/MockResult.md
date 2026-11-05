[**@ndigo/test v0.0.1**](../../README.md)

***

[@ndigo/test](../../README.md) / [mock-http](../README.md) / MockResult

# Interface: MockResult

A dispatched mock request with a fluent response.

## Properties

### response

> **response**: [`MemoryResponse`](../../memory-response/interfaces/MemoryResponse.md)

The captured response.

***

### route

> **route**: [`PreparedRoute`](../../request-builder/interfaces/PreparedRoute.md)

The route that was dispatched (useful for assertions).

## Methods

### json()

> **json**(): `unknown`

Parse the response body as JSON.

#### Returns

`unknown`

The parsed object, or `undefined` when the body is empty.

***

### text()

> **text**(): `string`

The raw response body as a string.

#### Returns

`string`

The body, or an empty string when none.
