[**@blue/signals v0.0.1**](../../README.md)

***

[@blue/signals](../../README.md) / [blue-signals](../README.md) / EventSource

# Interface: EventSource

An emitter-shaped source of event occurrences. Deliberately structural:
any object exposing `on`/`off` — e.g. `@blue/context`'s `Emitter` —
satisfies it, so `@blue/signals` stays free of that dependency.

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
