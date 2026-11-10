[**@ndigo/ai v0.0.1**](../../README.md)

***

[@ndigo/ai](../../README.md) / [stream](../README.md) / toServerSentEvents

# Function: toServerSentEvents()

> **toServerSentEvents**(`events`): `AsyncGenerator`\<[`AIServerSentEvent`](../interfaces/AIServerSentEvent.md)\>

Maps agent events to `ServerSentEventView` frames.

## Parameters

### events

`AsyncIterable`\<[`AIStreamEvent`](../../agent/type-aliases/AIStreamEvent.md)\>

The agent stream events.

## Returns

`AsyncGenerator`\<[`AIServerSentEvent`](../interfaces/AIServerSentEvent.md)\>

An async iterable of SSE envelopes.

## Example

```ts
return new ServerSentEventView(toServerSentEvents(agent.stream(request)));
```
