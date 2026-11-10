[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [model](../README.md) / AiStepStream

# Type Alias: AiStepStream

> **AiStepStream** = `AsyncGenerator`\<[`AiStepStreamEvent`](AiStepStreamEvent.md), [`AiStepResult`](../interfaces/AiStepResult.md), `void`\>

A streaming model step. The generator returns the settled step once the
provider stream ends.
