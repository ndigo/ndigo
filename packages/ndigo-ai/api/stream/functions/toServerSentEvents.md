[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [stream](../README.md) / toServerSentEvents

# Function: toServerSentEvents()

> **toServerSentEvents**(`events`): `AsyncGenerator`\<[`AiServerSentEvent`](../interfaces/AiServerSentEvent.md)\>

Maps agent events to `ServerSentEventView` frames.

## Parameters

### events

`AsyncIterable`\<[`AiStreamEvent`](../../agent/type-aliases/AiStreamEvent.md)\>

The agent stream events.

## Returns

`AsyncGenerator`\<[`AiServerSentEvent`](../interfaces/AiServerSentEvent.md)\>

An async iterable of SSE envelopes.

## Example

```ts
return new ServerSentEventView(toServerSentEvents(agent.stream(request)));
```
