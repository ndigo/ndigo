[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AIStepStream

# Type Alias: AIStepStream

> **AIStepStream** = `AsyncGenerator`\<[`AIStepStreamEvent`](AIStepStreamEvent.md), [`AIStepResult`](../interfaces/AIStepResult.md), `void`\>

A streaming model step. The generator returns the settled step once the
provider stream ends.
