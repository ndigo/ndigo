[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [messages](../README.md) / AiFinishReason

# Type Alias: AiFinishReason

> **AiFinishReason** = `"stop"` \| `"length"` \| `"content-filter"` \| `"tool-calls"` \| `"error"` \| `"interrupted"` \| `"other"` \| `"max-steps"`

Why a model step or the whole run finished. `max-steps` is produced by the
agent loop; the remaining values mirror the provider finish reasons.
