[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiStepResult

# Interface: AiStepResult

One completed model step: text, tool calls (if any), and usage.

## Properties

### finishReason

> `readonly` **finishReason**: [`AiFinishReason`](../../messages/type-aliases/AiFinishReason.md)

Why the provider stopped.

***

### text

> `readonly` **text**: `string`

The assistant text produced in this step.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`AiToolCall`](../../messages/interfaces/AiToolCall.md)[]

Tool calls the model requested; the agent executes them.

***

### usage

> `readonly` **usage**: [`AiTokenUsage`](../../messages/interfaces/AiTokenUsage.md)

Token usage for this step.
