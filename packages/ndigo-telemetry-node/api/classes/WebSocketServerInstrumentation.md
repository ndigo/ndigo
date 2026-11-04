[**@ndigo/telemetry-node v0.0.1**](../README.md)

***

[@ndigo/telemetry-node](../README.md) / WebSocketServerInstrumentation

# Class: WebSocketServerInstrumentation

Instrumentation for [NodeSocketSessionRegistry](#) (AD-21/AD-22):

- **Session lifetime**: `register`/`remove` pair into a
  `SocketSession.connect` SERVER span (path, duration, close code) —
  the socket analog of the SSE stream-lifetime instrumentation.
- **Counters**: sessions opened / closed (per path + close code),
  fan-out **delivered** messages + bytes — scaled by recipient count, so a
  broadcast to N open sessions records N messages and N × wire bytes (per
  path; per room only with
  [WebSocketServerInstrumentationOptions.roomAttribute](../interfaces/WebSocketServerInstrumentationOptions.md#roomattribute)),
  backpressure closes (close code `1013`).

Backpressure envelope (`close`/`drop`, buffered bytes) also reaches the
registry's `onOverflow` observer when applications wire one (drop-mode
decisions have no close event and are visible only there).

## Example

```ts
configureTelemetry({
  instrumentations: [new WebSocketServerInstrumentation()],
});
```

## Extends

- `AbstractBaseInstrumentation`

## Constructors

### Constructor

> **new WebSocketServerInstrumentation**(`options?`): `WebSocketServerInstrumentation`

#### Parameters

##### options?

[`WebSocketServerInstrumentationOptions`](../interfaces/WebSocketServerInstrumentationOptions.md) = `{}`

Room-attribute opt-in (see
  [WebSocketServerInstrumentationOptions](../interfaces/WebSocketServerInstrumentationOptions.md)).

#### Returns

`WebSocketServerInstrumentation`

#### Overrides

`AbstractBaseInstrumentation.constructor`

## Methods

### disable()

> **disable**(): `void`

Hook for subclasses to wire up `_unwrap` calls.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.disable`

***

### enable()

> **enable**(): `void`

Hook for subclasses to wire up `_wrap` calls.

#### Returns

`void`

#### Overrides

`AbstractBaseInstrumentation.enable`
