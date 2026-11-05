[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [event-bridge](../README.md) / eventsToSignal

# Function: eventsToSignal()

> **eventsToSignal**\<`T`\>(`source`, `type`, `target`, `transform?`): () => `void`

Bridges one event type of an emitter-shaped source into a signal,
writing each occurrence's payload (first argument; transform for other
shapes) as the signal's value. Occurrences collapse to the latest
payload — inherent to signals, which hold state, not histories.

## Type Parameters

### T

`T`

## Parameters

### source

[`EventSource`](../interfaces/EventSource.md)

The emitter-shaped source to subscribe to.

### type

`string` \| `symbol`

The event type whose occurrences are captured.

### target

`Signal`\<`T`\>

The signal written with each occurrence's payload.

### transform?

(`payload`) => `T`

Maps each payload to the signal value. Default: identity.

## Returns

A stop function: unsubscribes from the source.

() => `void`

## Example

```ts
const status = signal<'up' | 'down'>('down');
const stop = eventsToSignal(context, 'service:status', status, (payload) => payload.status);
// views subscribed to `status` reflect the latest service state
stop(); // tear down
```
