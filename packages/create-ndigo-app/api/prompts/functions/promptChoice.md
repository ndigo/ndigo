[**create-ndigo-app v0.0.1**](../../README.md)

***

[create-ndigo-app](../../README.md) / [prompts](../README.md) / promptChoice

# Function: promptChoice()

> **promptChoice**\<`T`\>(`question`, `choices`, `defaultValue`): `Promise`\<`T`\>

Prompts for a choice from a fixed list, returning the default on empty input.

## Type Parameters

### T

`T` *extends* `string`

## Parameters

### question

`string`

The prompt shown to the user.

### choices

readonly `T`[]

The allowed answers.

### defaultValue

`T`

Value returned when the answer is blank.

## Returns

`Promise`\<`T`\>

The selected choice.

## Throws

When the answer is not one of `choices`.
