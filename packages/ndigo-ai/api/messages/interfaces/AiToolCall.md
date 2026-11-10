[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [messages](../README.md) / AiToolCall

# Interface: AiToolCall

A tool call produced by a model. `input` is the decoded JSON arguments
object; the model's schema has already been applied by the adapter.

## Properties

### id

> `readonly` **id**: `string`

Provider-assigned call id, used to pair the call with its result.

***

### input

> `readonly` **input**: `Record`\<`string`, `unknown`\>

Decoded JSON arguments.

***

### name

> `readonly` **name**: `string`

The tool name from the model's tool definition.
