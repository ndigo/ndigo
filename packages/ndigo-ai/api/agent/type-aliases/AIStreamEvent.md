[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIStreamEvent

# Type Alias: AIStreamEvent

> **AIStreamEvent** = \{ `text`: `string`; `type`: `"text-delta"`; \} \| \{ `call`: [`AIToolCall`](../../messages/interfaces/AIToolCall.md); `type`: `"tool-call"`; \} \| \{ `result`: [`AIToolResult`](../../messages/interfaces/AIToolResult.md); `type`: `"tool-result"`; \} \| \{ `result`: [`AIRunResult`](../interfaces/AIRunResult.md); `type`: `"finish"`; \}

Incremental events from [AIAgent.stream](../classes/AIAgent.md#stream).
