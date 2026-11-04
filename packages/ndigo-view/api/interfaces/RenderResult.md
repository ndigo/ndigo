[**@ndigo/view v0.0.1**](../README.md)

***

[@ndigo/view](../README.md) / RenderResult

# Interface: RenderResult

A complete response document produced by a [ProducerView](ProducerView.md).

## Properties

### body

> **body**: `string` \| `Uint8Array`\<`ArrayBufferLike`\> \| `AsyncIterable`\<`unknown`, `any`, `any`\>

The produced body: a complete document string, raw bytes, or a stream.

***

### headers?

> `optional` **headers?**: `Record`\<`string`, `string`\>

Response headers. A `Content-Type` derived from [\`mediaType\`](#mediatype)
is added when absent.

***

### mediaType?

> `optional` **mediaType?**: `MediaType`

The media type of the produced body.

***

### status?

> `optional` **status?**: `number`

HTTP status code. Defaults to `200` when omitted.
