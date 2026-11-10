[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiRunResult

# Interface: AiRunResult

The settled result of a run.

## Properties

### finishReason

> `readonly` **finishReason**: [`AiFinishReason`](../../messages/type-aliases/AiFinishReason.md)

Why the run ended. `max-steps` means the loop hit its bound.

***

### messages

> `readonly` **messages**: readonly [`AiMessage`](../../messages/type-aliases/AiMessage.md)[]

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

> `readonly` **toolCalls**: readonly [`AiToolCall`](../../messages/interfaces/AiToolCall.md)[]

Every tool call the model requested, in order.

***

### toolResults

> `readonly` **toolResults**: readonly [`AiToolResult`](../../messages/interfaces/AiToolResult.md)[]

Every tool execution, in call order.

***

### usage

> `readonly` **usage**: [`AiTokenUsage`](../../messages/interfaces/AiTokenUsage.md)

Summed token usage across all steps.
