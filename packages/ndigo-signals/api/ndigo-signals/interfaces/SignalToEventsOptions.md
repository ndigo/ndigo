[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [ndigo-signals](../README.md) / SignalToEventsOptions

# Interface: SignalToEventsOptions\<T\>

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
