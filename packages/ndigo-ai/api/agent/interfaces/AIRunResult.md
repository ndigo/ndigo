[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIRunResult

# Interface: AIRunResult

The settled result of a run.

## Properties

### finishReason

> `readonly` **finishReason**: [`AIFinishReason`](../../messages/type-aliases/AIFinishReason.md)

Why the run ended. `max-steps` means the loop hit its bound.

***

### messages

> `readonly` **messages**: readonly [`AIMessage`](../../messages/type-aliases/AIMessage.md)[]

The full conversation, including assistant tool calls and results.

***

### steps

> `readonly` **steps**: `number`

Number of model calls made.

***

### text

> `readonly` **text**: `string`

Assistant text from the final step.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`AIToolCall`](../../messages/interfaces/AIToolCall.md)[]

Every tool call the model requested, in order.

***

### toolResults

> `readonly` **toolResults**: readonly [`AIToolResult`](../../messages/interfaces/AIToolResult.md)[]

Every tool execution, in call order.

***

### usage

> `readonly` **usage**: [`AITokenUsage`](../../messages/interfaces/AITokenUsage.md)

Summed token usage across all steps.
