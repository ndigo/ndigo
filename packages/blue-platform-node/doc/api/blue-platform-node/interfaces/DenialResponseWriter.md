[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / DenialResponseWriter

# Interface: DenialResponseWriter

Minimal response writer accepted by [finalizeInterceptorDenial](../functions/finalizeInterceptorDenial.md) —
compatible with Node's `ServerResponse` and the in-memory MockHTTP sink.
`writableEnded`/`destroyed` are optional so a sink that models its own
completion (MockHTTP's `ResponseSink`) is still accepted.

## Extends

- [`ProblemResponseWriter`](ProblemResponseWriter.md)

## Properties

### destroyed?

> `readonly` `optional` **destroyed?**: `boolean`

`ServerResponse`: the socket was destroyed.

***

### writableEnded?

> `readonly` `optional` **writableEnded?**: `boolean`

`ServerResponse`: the response was fully finalized.

## Methods

### end()

> **end**(`body?`): `void`

Finalize the body.

#### Parameters

##### body?

`unknown`

#### Returns

`void`

#### Inherited from

[`ProblemResponseWriter`](ProblemResponseWriter.md).[`end`](ProblemResponseWriter.md#end)

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

#### Inherited from

[`ProblemResponseWriter`](ProblemResponseWriter.md).[`writeHead`](ProblemResponseWriter.md#writehead)
