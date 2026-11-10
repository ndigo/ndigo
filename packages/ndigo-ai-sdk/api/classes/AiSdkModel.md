[**@ndigo/ai-sdk v0.0.1**](../README.md)

***

[@ndigo/ai-sdk](../README.md) / AiSdkModel

# Class: AiSdkModel

Adapts an AI SDK `LanguageModel` to the provider-neutral `AiModel`
contract.

The adapter declares tools to the model but never executes them — the
`@ndigo/ai` agent loop owns execution and telemetry, so MCP tools and local
sources behave identically across providers.

## Implements

- `AiModel`

## Constructors

### Constructor

> **new AiSdkModel**(`model`, `options?`): `AiSdkModel`

#### Parameters

##### model

`LanguageModel`

The AI SDK language model (provider package output).

##### options?

[`AiSdkModelOptions`](../interfaces/AiSdkModelOptions.md) = `{}`

Optional identity overrides.

#### Returns

`AiSdkModel`

## Properties

### info

> `readonly` **info**: `AiModelInfo`

Model identity used in telemetry and rate-limit keys.

#### Implementation of

`AiModel.info`

## Methods

### generateObject()

> **generateObject**\<`T`\>(`request`): `Promise`\<`AiObjectResult`\<`T`\>\>

Generates a Zod-validated object through the AI SDK.

#### Type Parameters

##### T

`T`

#### Parameters

##### request

`AiObjectRequest`\<`T`\>

The schema and conversation.

#### Returns

`Promise`\<`AiObjectResult`\<`T`\>\>

The validated object and usage.

#### Implementation of

`AiModel.generateObject`

***

### generateStep()

> **generateStep**(`request`): `Promise`\<`AiStepResult`\>

Performs one non-streaming AI SDK call.

#### Parameters

##### request

`AiStepRequest`

The conversation, tools, and sampling options.

#### Returns

`Promise`\<`AiStepResult`\>

The settled step.

#### Implementation of

`AiModel.generateStep`

***

### streamStep()

> **streamStep**(`request`): `AiStepStream`

Performs one streaming AI SDK call and returns the settled step.

#### Parameters

##### request

`AiStepRequest`

The conversation, tools, and sampling options.

#### Returns

`AiStepStream`

The step event stream; its return value is the settled step.

#### Implementation of

`AiModel.streamStep`
