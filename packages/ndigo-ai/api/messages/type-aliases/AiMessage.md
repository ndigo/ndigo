[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [messages](../README.md) / AiMessage

# Type Alias: AiMessage

> **AiMessage** = \{ `content`: `string`; `role`: `"system"`; \} \| \{ `content`: `string`; `role`: `"user"`; \} \| \{ `content`: `string`; `role`: `"assistant"`; `toolCalls?`: readonly [`AiToolCall`](../interfaces/AiToolCall.md)[]; \} \| \{ `name`: `string`; `output`: `unknown`; `role`: `"tool"`; `toolCallId`: `string`; \}

One message in a conversation.

Assistant messages may carry tool calls alongside text. Tool messages are
produced by the agent loop after executing those calls; callers normally
construct only `system`, `user`, and `assistant` messages.
