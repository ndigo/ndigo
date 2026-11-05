[**@ndigo/signals v0.0.1**](../../README.md)

***

[@ndigo/signals](../../README.md) / [event-bridge](../README.md) / EventSource

# Interface: EventSource

An emitter-shaped source of event occurrences. Deliberately structural:
any object exposing `on`/`off` — e.g. `@ndigo/context`'s `Emitter` —
satisfies it, so `@ndigo/signals` stays free of that dependency.

## Methods

### off()

> **off**(`type`, `listener`): `unknown`

#### Parameters

##### type

`string` \| `symbol`

##### listener

(...`args`) => `void`

#### Returns

`unknown`

***

### on()

> **on**(`type`, `listener`): `unknown`

#### Parameters

##### type

`string` \| `symbol`

##### listener

(...`args`) => `void`

#### Returns

`unknown`
