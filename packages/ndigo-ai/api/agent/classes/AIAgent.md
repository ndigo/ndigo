[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIAgent

# Class: AIAgent

Drives one model through a bounded tool-calling loop.

## Constructors

### Constructor

> **new AIAgent**(`options`): `AIAgent`

#### Parameters

##### options

[`AIAgentOptions`](../interfaces/AIAgentOptions.md)

The model, optional tool source, and policy.

#### Returns

`AIAgent`

#### Throws

When `maxSteps` is not a positive integer.

## Accessors

### modelInfo

#### Get Signature

> **get** **modelInfo**(): [`AIModelInfo`](../../model/interfaces/AIModelInfo.md)

The model identity this agent drives.

##### Returns

[`AIModelInfo`](../../model/interfaces/AIModelInfo.md)

## Methods

### object()

> **object**\<`T`\>(`request`): `Promise`\<[`AIObjectResult`](../../model/interfaces/AIObjectResult.md)\<`T`\>\>

Generates a schema-validated object, without tools.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

[`AIObjectRequest`](../../model/interfaces/AIObjectRequest.md)\<`T`\>

The Zod schema and conversation.

#### Returns

`Promise`\<[`AIObjectResult`](../../model/interfaces/AIObjectResult.md)\<`T`\>\>

The validated object and usage.

***

### run()

> **run**(`request`): `Promise`\<[`AIRunResult`](../interfaces/AIRunResult.md)\>

Runs the tool loop to completion.

#### Parameters

##### request

[`AIRunRequest`](../interfaces/AIRunRequest.md)

The conversation and sampling options.

#### Returns

`Promise`\<[`AIRunResult`](../interfaces/AIRunResult.md)\>

The settled run result.

***

### stream()

> **stream**(`request`): [`AIAgentStream`](../type-aliases/AIAgentStream.md)

Streams a run. Text deltas and tool calls arrive as they happen; the
generator returns the settled result after the loop.

#### Parameters

##### request

[`AIRunRequest`](../interfaces/AIRunRequest.md)

The conversation and sampling options.

#### Returns

[`AIAgentStream`](../type-aliases/AIAgentStream.md)

The event generator; consume it to completion.
