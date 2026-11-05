[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [problem-details](../README.md) / writeProblem

# Function: writeProblem()

> **writeProblem**(`res`, `details`, `headers?`): `void`

Writes an RFC 9457 problem document to a response: `application/problem+json`
content type, `Cache-Control: no-store`, and `Vary: Accept` (negotiation may
later select a content type; error responses must not be cached).

## Parameters

### res

[`ProblemResponseWriter`](../interfaces/ProblemResponseWriter.md)

The response writer (ServerResponse or MockHTTP sink).

### details

[`ProblemDetails`](../interfaces/ProblemDetails.md)

The problem document.

### headers?

`Record`\<`string`, `string` \| `string`[]\> = `{}`

## Returns

`void`
