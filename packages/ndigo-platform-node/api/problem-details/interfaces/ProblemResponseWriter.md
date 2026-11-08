[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [problem-details](../README.md) / ProblemResponseWriter

# Interface: ProblemResponseWriter

Minimal response writer accepted by [writeProblem](../functions/writeProblem.md) — compatible with
Node's `ServerResponse` and the in-memory MockHTTP sink.

## Extended by

- [`DenialResponseWriter`](../../finalize-denial/interfaces/DenialResponseWriter.md)

## Methods

### end()

> **end**(`body?`): `void`

Finalize the body.

#### Parameters

##### body?

`unknown`

The body to write.

#### Returns

`void`

***

### writeHead()

> **writeHead**(`status`, `headers`): `void`

Write the status line + headers.

#### Parameters

##### status

`number`

The status code.

##### headers

`Record`\<`string`, `string` \| `string`[]\>

The headers.

#### Returns

`void`
