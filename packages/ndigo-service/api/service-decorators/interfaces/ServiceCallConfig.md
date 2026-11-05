[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [service-decorators](../README.md) / ServiceCallConfig

# Interface: ServiceCallConfig

Configuration for a `@*Call`-decorated method.

## Properties

### method

> **method**: [`HTTPMethod`](../type-aliases/HTTPMethod.md)

HTTP method for the call.

***

### path

> **path**: `string`

Path template relative to the service base URL; `:param` slots are filled from method args.

***

### responseSchema?

> `optional` **responseSchema?**: `ZodType`\<`unknown`, `unknown`, `$ZodTypeInternals`\<`unknown`, `unknown`\>\>

Optional Zod schema validating the JSON response body. When set, the
parsed body is validated and the typed data is returned; the raw
`Response` is returned when omitted.

***

### stream?

> `optional` **stream?**: `boolean`

Declares a streaming (SSE) call (AD-09): the method returns an
`AsyncIterable` of parsed Server-Sent Events instead of a single
response, with `Accept: text/event-stream` sent on the request. When
combined with `responseSchema`, each event's `data` payload is
validated and the typed value is yielded.
