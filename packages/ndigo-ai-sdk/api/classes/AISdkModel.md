[**@ndigo/ai-sdk v0.0.1**](../README.md)

***

[@ndigo/ai-sdk](../README.md) / AISdkModel

# Class: AISdkModel

Adapts an AI SDK `LanguageModel` to the provider-neutral `AIModel`
contract.

The adapter declares tools to the model but never executes them — the
`@ndigo/ai` agent loop owns execution and telemetry, so MCP tools and local
sources behave identically across providers.

## Implements

- `AIModel`

## Constructors

### Constructor

> **new AISdkModel**(`model`, `options?`): `AISdkModel`

#### Parameters

##### model

`LanguageModel`

The AI SDK language model (provider package output).

##### options?

[`AISdkModelOptions`](../interfaces/AISdkModelOptions.md) = `{}`

Optional identity overrides.

#### Returns

`AISdkModel`

## Properties

### info

> `readonly` **info**: `AIModelInfo`

Model identity used in telemetry and rate-limit keys.

#### Implementation of

`AIModel.info`

## Methods

### generateObject()

> **generateObject**\<`T`\>(`request`): `Promise`\<`AIObjectResult`\<`T`\>\>

Generates a Zod-validated object through the AI SDK.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

`AIObjectRequest`\<`T`\>

The schema and conversation.

#### Returns

`Promise`\<`AIObjectResult`\<`T`\>\>

The validated object and usage.

#### Implementation of

`AIModel.generateObject`

***

### generateStep()

> **generateStep**(`request`): `Promise`\<`AIStepResult`\>

Performs one non-streaming AI SDK call.

#### Parameters

##### request

`AIStepRequest`

The conversation, tools, and sampling options.

#### Returns

`Promise`\<`AIStepResult`\>

The settled step.

#### Implementation of

`AIModel.generateStep`

***

### streamStep()

> **streamStep**(`request`): `AIStepStream`

Performs one streaming AI SDK call and returns the settled step.

#### Parameters

##### request

`AIStepRequest`

The conversation, tools, and sampling options.

#### Returns

`AIStepStream`

The step event stream; its return value is the settled step.

#### Implementation of

`AIModel.streamStep`
