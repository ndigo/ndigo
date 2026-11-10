[**@ndigo/ai-sdk v0.0.1**](../README.md)

***

[@ndigo/ai-sdk](../README.md) / AiSdkModelOptions

# Interface: AiSdkModelOptions

Optional identity overrides. Without them the adapter reads `provider` and
`modelId` from the AI SDK model and falls back to `ai-sdk`.

## Properties

### model?

> `readonly` `optional` **model?**: `string`

Model id used in telemetry and rate-limit keys.

***

### provider?

> `readonly` `optional` **provider?**: `string`

Provider name used in telemetry and rate-limit keys.
