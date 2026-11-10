[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AIObjectResult

# Interface: AIObjectResult\<T\>

A structured-output result.

## Type Parameters

### T

`T`

## Properties

### finishReason

> `readonly` **finishReason**: [`AIFinishReason`](../../messages/type-aliases/AIFinishReason.md)

Why the provider stopped.

***

### object

> `readonly` **object**: `T`

The schema-validated object.

***

### usage

> `readonly` **usage**: [`AITokenUsage`](../../messages/interfaces/AITokenUsage.md)

Token usage for the call.
