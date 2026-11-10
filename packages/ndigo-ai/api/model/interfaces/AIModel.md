[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AIModel

# Interface: AIModel

The provider-neutral language-model contract.

## Properties

### info

> `readonly` **info**: [`AIModelInfo`](AIModelInfo.md)

Identity used in telemetry and rate limits.

## Methods

### generateObject()

> **generateObject**\<`T`\>(`request`): `Promise`\<[`AIObjectResult`](AIObjectResult.md)\<`T`\>\>

Generates a schema-validated object.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

[`AIObjectRequest`](AIObjectRequest.md)\<`T`\>

The schema and conversation.

#### Returns

`Promise`\<[`AIObjectResult`](AIObjectResult.md)\<`T`\>\>

The validated object and usage.

***

### generateStep()

> **generateStep**(`request`): `Promise`\<[`AIStepResult`](AIStepResult.md)\>

Performs one non-streaming model call. Tools are declared to the model
but never executed by the adapter.

#### Parameters

##### request

[`AIStepRequest`](AIStepRequest.md)

The conversation, tools, and sampling options.

#### Returns

`Promise`\<[`AIStepResult`](AIStepResult.md)\>

The settled step.

***

### streamStep()

> **streamStep**(`request`): [`AIStepStream`](../type-aliases/AIStepStream.md)

Performs one streaming model call. Tools are declared but never
executed by the adapter.

#### Parameters

##### request

[`AIStepRequest`](AIStepRequest.md)

The conversation, tools, and sampling options.

#### Returns

[`AIStepStream`](../type-aliases/AIStepStream.md)

The step event stream; its return value is the settled step.
