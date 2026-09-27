[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / ProblemResponseWriter

# Interface: ProblemResponseWriter

Minimal response writer accepted by [writeProblem](../functions/writeProblem.md) — compatible with
Node's `ServerResponse` and the in-memory MockHTTP sink.

## Methods

### end()

> **end**(`body?`): `void`

Finalize the body.

#### Parameters

##### body?

`unknown`

#### Returns

`void`

***

### writeHead()

> **writeHead**(`status`, `headers`): `void`

Write the status line + headers.

#### Parameters

##### status

`number`

##### headers

`Record`\<`string`, `string` \| `string`[]\>

#### Returns

`void`
