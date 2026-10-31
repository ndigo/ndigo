[**@blue/telemetry-web v0.0.1**](../README.md)

***

[@blue/telemetry-web](../README.md) / countSocketClientBytes

# Function: countSocketClientBytes()

> **countSocketClientBytes**(): (`bytes`) => `void`

Exact outbound-byte wiring for a `WebSocketClient` — use as the client's
`onSend` option (constructor-injected; the client reports the actual bytes
written to the transport, buffered flushes and retried writes included):

```ts
const chat = new WebSocketClient(url, { onSend: countSocketClientBytes() });
```

While wired, [WebSocketClientInstrumentation](../classes/WebSocketClientInstrumentation.md)'s `send` wrap skips its
own payload estimation for that client (TEL-08), so `blue.socket.client
.messages.bytes` counts each wire write exactly once — no re-serialized
estimation, no double count.

## Returns

An `onSend` observer feeding `blue.socket.client.messages.bytes`.

(`bytes`) => `void`
