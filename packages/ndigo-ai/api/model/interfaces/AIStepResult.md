[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AIStepResult

# Interface: AIStepResult

One completed model step: text, tool calls (if any), and usage.

## Properties

### finishReason

> `readonly` **finishReason**: [`AIFinishReason`](../../messages/type-aliases/AIFinishReason.md)

Why the provider stopped.

***

### text

> `readonly` **text**: `string`

The assistant text produced in this step.

***

### toolCalls

> `readonly` **toolCalls**: readonly [`AIToolCall`](../../messages/interfaces/AIToolCall.md)[]

Tool calls the model requested; the agent executes them.

***

### usage

> `readonly` **usage**: [`AITokenUsage`](../../messages/interfaces/AITokenUsage.md)

Token usage for this step.
