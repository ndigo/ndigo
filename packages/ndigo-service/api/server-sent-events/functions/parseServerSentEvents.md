[**@ndigo/service v0.0.1**](../../README.md)

***

[@ndigo/service](../../README.md) / [server-sent-events](../README.md) / parseServerSentEvents

# Function: parseServerSentEvents()

> **parseServerSentEvents**(`chunks`): `AsyncGenerator`\<[`ServerSentEvent`](../../index/interfaces/ServerSentEvent.md)\>

Parses an async chunk stream into Server-Sent Events.

## Parameters

### chunks

`AsyncIterable`\<`string`\>

The decoded body chunks of the event stream.

## Returns

`AsyncGenerator`\<[`ServerSentEvent`](../../index/interfaces/ServerSentEvent.md)\>

An async iterable of parsed events, as they complete.

## Example

```ts
for await (const event of parseServerSentEvents(chunks)) {
    console.log(event.event, event.data);
}
```
