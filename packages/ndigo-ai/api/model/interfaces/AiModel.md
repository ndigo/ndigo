[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiModel

# Interface: AiModel

The provider-neutral language-model contract.

## Properties

### info

> `readonly` **info**: [`AiModelInfo`](AiModelInfo.md)

Identity used in telemetry and rate limits.

## Methods

### generateObject()

> **generateObject**\<`T`\>(`request`): `Promise`\<[`AiObjectResult`](AiObjectResult.md)\<`T`\>\>

Generates a schema-validated object.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

[`AiObjectRequest`](AiObjectRequest.md)\<`T`\>

The schema and conversation.

#### Returns

`Promise`\<[`AiObjectResult`](AiObjectResult.md)\<`T`\>\>

The validated object and usage.

***

### generateStep()

> **generateStep**(`request`): `Promise`\<[`AiStepResult`](AiStepResult.md)\>

Performs one non-streaming model call. Tools are declared to the model
but never executed by the adapter.

#### Parameters

##### request

[`AiStepRequest`](AiStepRequest.md)

The conversation, tools, and sampling options.

#### Returns

`Promise`\<[`AiStepResult`](AiStepResult.md)\>

The settled step.

***

### streamStep()

> **streamStep**(`request`): [`AiStepStream`](../type-aliases/AiStepStream.md)

Performs one streaming model call. Tools are declared but never
executed by the adapter.

#### Parameters

##### request

[`AiStepRequest`](AiStepRequest.md)

The conversation, tools, and sampling options.

#### Returns

[`AiStepStream`](../type-aliases/AiStepStream.md)

The step event stream; its return value is the settled step.
