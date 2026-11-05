[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [event-bridge](../README.md) / SignalToEventsOptions

# Interface: SignalToEventsOptions\<T\>

Options for the signal↔event bridges: an optional `transform` mapping the
source value to the emitted payload (default: the value itself) and
`emitInitial` to emit the current value once on subscribe (default `false` — a
subscription must not synthesize an occurrence from existing state).

## Type Parameters

### T

`T`

## Properties

### emitInitial?

> `optional` **emitInitial?**: `boolean`

Emit the current value once on subscribe. Default: `false` —
subscribing must not synthesize an occurrence from existing state.

***

### transform?

> `optional` **transform?**: (`value`) => `unknown`

Maps the signal value to the emitted payload. Default: the value itself.

#### Parameters

##### value

`T`

#### Returns

`unknown`
