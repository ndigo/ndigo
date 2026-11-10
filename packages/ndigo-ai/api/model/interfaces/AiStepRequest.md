[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiStepRequest

# Interface: AiStepRequest

One model call, including the full conversation so far and the tools the
model may call. Adapters MUST NOT execute tools: the agent loop does that,
which keeps execution and telemetry provider-independent.

## Properties

### maxOutputTokens?

> `readonly` `optional` **maxOutputTokens?**: `number`

Output-token cap, when the provider supports it.

***

### messages

> `readonly` **messages**: readonly [`AiMessage`](../../messages/type-aliases/AiMessage.md)[]

The conversation, including prior tool results.

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Cancels the provider call.

***

### temperature?

> `readonly` `optional` **temperature?**: `number`

Sampling temperature, when the provider supports it.

***

### tools?

> `readonly` `optional` **tools?**: readonly [`AiToolDescriptor`](../../tools/interfaces/AiToolDescriptor.md)[]

Tools the model may call in this step.
