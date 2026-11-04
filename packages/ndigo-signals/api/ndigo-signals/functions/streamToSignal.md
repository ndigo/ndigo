[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [ndigo-signals](../README.md) / streamToSignal

# Function: streamToSignal()

> **streamToSignal**\<`T`\>(`source`, `target`): () => `void`

Bridges an async iterable into a `Signal`, updating it as values arrive.

## Type Parameters

### T

`T`

## Parameters

### source

`AsyncIterable`\<`T`\>

The event stream to consume (e.g. a `stream: true`
  service call from `@ndigo/service`).

### target

`Signal`\<`T`\>

The signal written with each yielded value.

## Returns

A stop function: cancels consumption and closes the source.

() => `void`

## Example

```ts
const model = signal(initial);
const stop = streamToSignal(service.models(), model);
// views subscribed to `model` re-render on each pushed update
stop(); // tear down
```
