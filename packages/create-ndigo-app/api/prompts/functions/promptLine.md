[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [prompts](../README.md) / promptLine

# Function: promptLine()

> **promptLine**(`question`, `defaultValue?`): `Promise`\<`string`\>

Reads a single line from stdin with an optional default.

## Parameters

### question

`string`

The prompt shown to the user.

### defaultValue?

`string`

Value returned when the answer is blank.

## Returns

`Promise`\<`string`\>

The trimmed answer, or `defaultValue` when blank.
