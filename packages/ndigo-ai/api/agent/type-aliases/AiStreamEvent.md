[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiStreamEvent

# Type Alias: AiStreamEvent

> **AiStreamEvent** = \{ `text`: `string`; `type`: `"text-delta"`; \} \| \{ `call`: [`AiToolCall`](../../messages/interfaces/AiToolCall.md); `type`: `"tool-call"`; \} \| \{ `result`: [`AiToolResult`](../../messages/interfaces/AiToolResult.md); `type`: `"tool-result"`; \} \| \{ `result`: [`AiRunResult`](../interfaces/AiRunResult.md); `type`: `"finish"`; \}

Incremental events from [AiAgent.stream](../classes/AiAgent.md#stream).
