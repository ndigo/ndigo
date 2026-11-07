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

Removes a subscription previously installed with [EventSource.on](#on).

#### Parameters

##### type

`string` \| `symbol`

The event type the listener was registered for.

##### listener

(...`args`) => `void`

The exact listener passed to `on`.

#### Returns

`unknown`

The source's own unsubscribe result; ignored by the bridge.

***

### on()

> **on**(`type`, `listener`): `unknown`

Subscribes `listener` to occurrences of `type`.

#### Parameters

##### type

`string` \| `symbol`

The event type to listen for.

##### listener

(...`args`) => `void`

Invoked with each occurrence's payload.

#### Returns

`unknown`

The source's subscription handle; ignored by the bridge.
