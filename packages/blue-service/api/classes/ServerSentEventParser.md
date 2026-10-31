[**@blue/service v0.0.1**](../README.md)

***

[@blue/service](../README.md) / ServerSentEventParser

# Class: ServerSentEventParser

Incremental parser for `text/event-stream` content.

## Example

```ts
const parser = new ServerSentEventParser();
for (const chunk of chunks) {
    for (const event of parser.feed(chunk)) handle(event);
}
for (const event of parser.finish()) handle(event);
```

## Constructors

### Constructor

> **new ServerSentEventParser**(): `ServerSentEventParser`

#### Returns

`ServerSentEventParser`

## Methods

### feed()

> **feed**(`chunk`): [`ServerSentEvent`](../interfaces/ServerSentEvent.md)[]

Consume a transport chunk and return the complete events it contains.

Lines end with `CRLF`, `LF` or a lone `CR` (WHATWG event-stream
parsing), and one leading `U+FEFF` byte order mark is stripped from
the very start of the stream (REV-007).

#### Parameters

##### chunk

`string`

A decoded chunk of the event stream.

#### Returns

[`ServerSentEvent`](../interfaces/ServerSentEvent.md)[]

The events completed by this chunk.

***

### finish()

> **finish**(): [`ServerSentEvent`](../interfaces/ServerSentEvent.md)[]

Flush the trailing partial line and any pending event. Use when the
transport ends (a bounded stream, or a final chunk without a newline).

#### Returns

[`ServerSentEvent`](../interfaces/ServerSentEvent.md)[]

The events completed by the stream's end.
