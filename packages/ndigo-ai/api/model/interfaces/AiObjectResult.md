[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiObjectResult

# Interface: AiObjectResult\<T\>

A structured-output result.

## Type Parameters

### T

`T`

## Properties

### finishReason

> `readonly` **finishReason**: [`AiFinishReason`](../../messages/type-aliases/AiFinishReason.md)

Why the provider stopped.

***

### object

> `readonly` **object**: `T`

The schema-validated object.

***

### usage

> `readonly` **usage**: [`AiTokenUsage`](../../messages/interfaces/AiTokenUsage.md)

Token usage for the call.
