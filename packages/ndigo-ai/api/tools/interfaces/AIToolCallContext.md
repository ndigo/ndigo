[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [tools](../README.md) / AIToolCallContext

# Interface: AIToolCallContext

Per-call context passed to [AIToolSource.call](AIToolSource.md#call). The `callId` is the
model-assigned tool-call id and is recorded as `gen_ai.tool.call.id`.

## Properties

### callId?

> `readonly` `optional` **callId?**: `string`

The model-assigned tool-call id.
