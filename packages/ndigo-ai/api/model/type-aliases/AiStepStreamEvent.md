[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiStepStreamEvent

# Type Alias: AiStepStreamEvent

> **AiStepStreamEvent** = \{ `text`: `string`; `type`: `"text-delta"`; \} \| \{ `call`: [`AiToolCall`](../../messages/interfaces/AiToolCall.md); `type`: `"tool-call"`; \}

Incremental step output. The agent forwards `text-delta` events and
collects `tool-call` events; the generator's return value is the settled
[AiStepResult](../interfaces/AiStepResult.md).
