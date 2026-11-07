[**@ndigo/telemetry-web v0.0.1**](../../../../README.md)

***

[@ndigo/telemetry-web](../../../../README.md) / [instrumentation/websocket-client/websocket-client](../README.md) / WebSocketClientInstrumentation

# Class: WebSocketClientInstrumentation

Instrumentation for [WebSocketClient](#) (AD-22): outbound message
and byte counters + exactly one counted `close()` per session (a close
that follows a terminal drop counts; the latched repeat does not), via
prototype patches.

Status/reconnect metrics are **not** patchable (the client's status
signal lives on app-constructed instances) — wire
[countSocketClientStatus](../functions/countSocketClientStatus.md) into the `onStatusChange` option instead.
Outbound bytes are exact the same way: wire [countSocketClientBytes](../functions/countSocketClientBytes.md)
into `onSend` and this instrumentation's `send` wrap skips its own
estimation for that client (TEL-08).

## Example

```ts
// configureBrowserTelemetry already ran — hand it the registration you use
// for the shared instrumentations (or wrap the client directly):
new WebSocketClient(url, {
    onStatusChange: countSocketClientStatus(),
    onSend: countSocketClientBytes(),
});
```

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new WebSocketClientInstrumentation**(): `WebSocketClientInstrumentation`

#### Returns

`WebSocketClientInstrumentation`

#### Overrides

`AbstractBaseInstrumentation.constructor`

## Methods

### disable()

> **disable**(): `void`

Restores the original `send` and `close` methods.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Patches `WebSocketClient#send` and `#close` to count outbound messages,
estimated bytes (when `onSend` is unwired), and terminal closes.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
