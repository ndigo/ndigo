[**@ndigo/test v0.0.1**](../README.md)

***

[@ndigo/test](../README.md) / MemoryResponse

# Interface: MemoryResponse

A captured HTTP response: status code, headers, and body.

The body is captured raw (as delivered by `end`) — call `.json()` or
`.text()` to interpret it.

## Properties

### body

> **body**: `unknown`

Raw body as written by the handler/view, intended for `.json()`/`.text()`.

***

### completed

> **completed**: `boolean`

Whether the response was finalized (`end()` called).

***

### headers

> **headers**: `Record`\<`string`, `string` \| `string`[]\>

Response headers (lower-cased keys).

***

### status

> **status**: `number`

HTTP status code (defaults to 200).
