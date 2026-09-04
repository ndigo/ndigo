[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-test/src](../README.md) / MemoryResponse

# Interface: MemoryResponse

Defined in: packages/blue-test/src/memory-response.ts:17

A captured HTTP response: status code, headers, and body.

The body is captured raw (as delivered by `end`) — call `.json()` or
`.text()` to interpret it.

## Properties

### status

> **status**: `number`

Defined in: packages/blue-test/src/memory-response.ts:19

HTTP status code (defaults to 200).

***

### headers

> **headers**: `Record`\<`string`, `string`\>

Defined in: packages/blue-test/src/memory-response.ts:21

Response headers (lower-cased keys).

***

### body

> **body**: `unknown`

Defined in: packages/blue-test/src/memory-response.ts:23

Raw body as written by the handler/view, intended for `.json()`/`.text()`.

***

### completed

> **completed**: `boolean`

Defined in: packages/blue-test/src/memory-response.ts:25

Whether the response was finalized (`end()` called).
