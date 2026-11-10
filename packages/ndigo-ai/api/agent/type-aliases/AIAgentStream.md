[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [agent](../README.md) / AIAgentStream

# Type Alias: AIAgentStream

> **AIAgentStream** = `AsyncGenerator`\<[`AIStreamEvent`](AIStreamEvent.md), [`AIRunResult`](../interfaces/AIRunResult.md), `void`\>

The streaming run handle: an async generator of events whose return value
is the settled [AIRunResult](../interfaces/AIRunResult.md).
