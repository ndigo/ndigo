[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [stream](../README.md) / AiServerSentEvent

# Interface: AiServerSentEvent

One SSE frame produced from an [AiStreamEvent](../../agent/type-aliases/AiStreamEvent.md).

## Properties

### data

> `readonly` **data**: [`AiStreamEvent`](../../agent/type-aliases/AiStreamEvent.md)

The JSON-serializable event payload.

***

### event

> `readonly` **event**: `string`

The SSE `event:` name (`text-delta`, `tool-call`, `tool-result`, `finish`).
