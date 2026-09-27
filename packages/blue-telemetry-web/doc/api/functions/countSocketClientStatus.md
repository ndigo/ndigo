[**@blue/telemetry-web v0.0.1**](../README.md)

***

[@blue/telemetry-web](../README.md) / countSocketClientStatus

# Function: countSocketClientStatus()

> **countSocketClientStatus**(): (`status`) => `void`

Status-transition metric wiring for a `WebSocketClient` — use as the
client's `onStatusChange` option (constructor-injected seam; the client
is app-constructed, so prototype patches cannot see its signal):

```ts
const count = countSocketClientStatus();
const chat = new WebSocketClient(url, { onStatusChange: count });
```

Counts `blue.socket.client.{connecting,opened,reconnecting,closed}`
transitions with a `socket.status` attribute — reconnects are the
network-instability signal of interest.

## Returns

An `onStatusChange` observer.

(`status`) => `void`
