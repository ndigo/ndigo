[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [messages](../README.md) / AIToolResult

# Interface: AIToolResult

A completed tool execution, as reported in `AIRunResult`.

## Properties

### callId

> `readonly` **callId**: `string`

The call id this result answers.

***

### name

> `readonly` **name**: `string`

The tool name.

***

### output

> `readonly` **output**: `unknown`

The handler result, or an `{ error }` object when execution failed.
