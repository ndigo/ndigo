[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README.md) / signalToEvents

# Function: signalToEvents()

> **signalToEvents**\<`T`\>(`source`, `sink`, `type`, `options?`): () => `void`

Bridges a signal's changes into occurrences on an emitter-shaped sink,
emitting under the given event type.

## Type Parameters

### T

`T`

## Parameters

### source

`Signal`\<`T`\>

The signal whose changes are observed.

### sink

[`EventSink`](../interfaces/EventSink.md)

The emitter-shaped sink occurrences are emitted on.

### type

`string` \| `symbol`

The event type emitted for each change.

### options?

[`SignalToEventsOptions`](../interfaces/SignalToEventsOptions.md)\<`T`\> = `{}`

Payload shaping and initial-emission control.

## Returns

A stop function: disposes the underlying effect.

() => `void`

## Example

```ts
const stop = signalToEvents(counter, context, 'counter:changed', { transform: (n) => ({ count: n }) });
// listeners on 'counter:changed' fire on each change
stop(); // tear down
```
