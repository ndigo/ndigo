[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AIStepStreamEvent

# Type Alias: AIStepStreamEvent

> **AIStepStreamEvent** = \{ `text`: `string`; `type`: `"text-delta"`; \} \| \{ `call`: [`AIToolCall`](../../messages/interfaces/AIToolCall.md); `type`: `"tool-call"`; \}

Incremental step output. The agent forwards `text-delta` events and
collects `tool-call` events; the generator's return value is the settled
[AIStepResult](../interfaces/AIStepResult.md).
