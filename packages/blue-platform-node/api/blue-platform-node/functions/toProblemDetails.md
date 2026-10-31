[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / toProblemDetails

# Function: toProblemDetails()

> **toProblemDetails**(`body`, `status`, `title`, `instance?`): [`ProblemDetails`](../interfaces/ProblemDetails.md)

Builds a `ProblemDetails` for a 4xx/5xx handler-returned `ResponseEntity`
body that was not already a problem document: a string body becomes
`detail`, an `{ error }` object's string value becomes `detail`, and other
objects are JSON-serialized (the handler's own body — nothing internal is
added).

## Parameters

### body

`unknown`

The original response body.

### status

`number`

The HTTP status code.

### title

`string`

The status reason phrase.

### instance?

`string`

The request path, when known.

## Returns

[`ProblemDetails`](../interfaces/ProblemDetails.md)

A problem document.
