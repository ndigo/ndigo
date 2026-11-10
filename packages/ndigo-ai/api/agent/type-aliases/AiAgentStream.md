[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AiAgentStream

# Type Alias: AiAgentStream

> **AiAgentStream** = `AsyncGenerator`\<[`AiStreamEvent`](AiStreamEvent.md), [`AiRunResult`](../interfaces/AiRunResult.md), `void`\>

The streaming run handle: an async generator of events whose return value
is the settled [AiRunResult](../interfaces/AiRunResult.md).
