[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiObjectRequest

# Interface: AiObjectRequest\<T\>

A structured-output request: the model must return an object matching the
Zod schema.

## Type Parameters

### T

`T`

## Properties

### maxOutputTokens?

> `readonly` `optional` **maxOutputTokens?**: `number`

Output-token cap, when the provider supports it.

***

### messages

> `readonly` **messages**: readonly [`AiMessage`](../../messages/type-aliases/AiMessage.md)[]

The conversation driving the generation.

***

### schema

> `readonly` **schema**: `ZodType`\<`T`\>

The schema the returned object must satisfy.

***

### signal?

> `readonly` `optional` **signal?**: `AbortSignal`

Cancels the provider call.

***

### temperature?

> `readonly` `optional` **temperature?**: `number`

Sampling temperature, when the provider supports it.
