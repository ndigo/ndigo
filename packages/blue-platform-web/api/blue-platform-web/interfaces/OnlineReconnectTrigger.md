[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / OnlineReconnectTrigger

# Interface: OnlineReconnectTrigger

Browser-backed `ReconnectTrigger` wiring (AD-22 D3).

## Extends

- [`ReconnectTrigger`](#)

## Properties

### online

> `readonly` **online**: `Signal`\<`boolean`\>

True while the browser reports online (`navigator.onLine` + events).

## Methods

### dispose()

> **dispose**(): `void`

Stop listening to window events. Idempotent.

#### Returns

`void`

***

### onChange()

> **onChange**(`listener`): () => `void`

Subscribe to connection-relevant changes (online events, …).

#### Parameters

##### listener

() => `void`

Invoked when the environment state changes; the
  client reconnects immediately if it is currently reconnecting.

#### Returns

An unsubscribe function.

() => `void`

#### Inherited from

`ReconnectTrigger.onChange`
