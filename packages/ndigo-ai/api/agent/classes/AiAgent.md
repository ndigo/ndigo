[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiAgent

# Class: AiAgent

Drives one model through a bounded tool-calling loop.

## Constructors

### Constructor

> **new AiAgent**(`options`): `AiAgent`

#### Parameters

##### options

[`AiAgentOptions`](../interfaces/AiAgentOptions.md)

The model, optional tool source, and policy.

#### Returns

`AiAgent`

#### Throws

When `maxSteps` is not a positive integer.

## Accessors

### modelInfo

#### Get Signature

> **get** **modelInfo**(): [`AiModelInfo`](../../model/interfaces/AiModelInfo.md)

The model identity this agent drives.

##### Returns

[`AiModelInfo`](../../model/interfaces/AiModelInfo.md)

## Methods

### object()

> **object**\<`T`\>(`request`): `Promise`\<[`AiObjectResult`](../../model/interfaces/AiObjectResult.md)\<`T`\>\>

Generates a schema-validated object, without tools.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

[`AiObjectRequest`](../../model/interfaces/AiObjectRequest.md)\<`T`\>

The Zod schema and conversation.

#### Returns

`Promise`\<[`AiObjectResult`](../../model/interfaces/AiObjectResult.md)\<`T`\>\>

The validated object and usage.

***

### run()

> **run**(`request`): `Promise`\<[`AiRunResult`](../interfaces/AiRunResult.md)\>

Runs the tool loop to completion.

#### Parameters

##### request

[`AiRunRequest`](../interfaces/AiRunRequest.md)

The conversation and sampling options.

#### Returns

`Promise`\<[`AiRunResult`](../interfaces/AiRunResult.md)\>

The settled run result.

***

### stream()

> **stream**(`request`): [`AiAgentStream`](../type-aliases/AiAgentStream.md)

Streams a run. Text deltas and tool calls arrive as they happen; the
generator returns the settled result after the loop.

#### Parameters

##### request

[`AiRunRequest`](../interfaces/AiRunRequest.md)

The conversation and sampling options.

#### Returns

[`AiAgentStream`](../type-aliases/AiAgentStream.md)

The event generator; consume it to completion.
