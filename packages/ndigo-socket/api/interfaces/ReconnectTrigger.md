[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / ReconnectTrigger

# Interface: ReconnectTrigger

Environment wiring for an immediate retry (e.g. the browser `online`
event — `ndigo-platform-web` provides an implementation).

## Methods

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
