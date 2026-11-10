[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [stream](../README.md) / AIServerSentEvent

# Interface: AIServerSentEvent

One SSE frame produced from an [AIStreamEvent](../../agent/type-aliases/AIStreamEvent.md).

## Properties

### data

> `readonly` **data**: [`AIStreamEvent`](../../agent/type-aliases/AIStreamEvent.md)

The JSON-serializable event payload.

***

### event

> `readonly` **event**: `string`

The SSE `event:` name (`text-delta`, `tool-call`, `tool-result`, `finish`).
