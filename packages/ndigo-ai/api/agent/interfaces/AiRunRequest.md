[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiRunRequest

# Interface: AiRunRequest

One agent run request.

## Properties

### maxOutputTokens?

> `readonly` `optional` **maxOutputTokens?**: `number`

Output-token cap, when the provider supports it.

***

### messages

> `readonly` **messages**: readonly [`AiMessage`](../../messages/type-aliases/AiMessage.md)[]

The conversation, typically system + user messages.

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Cancels the run and the in-flight provider call.

***

### temperature?

> `readonly` `optional` **temperature?**: `number`

Sampling temperature, when the provider supports it.
