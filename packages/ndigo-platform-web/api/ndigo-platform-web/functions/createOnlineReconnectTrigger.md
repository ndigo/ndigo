[**@ndigo/platform-web v0.0.1**](../../README.md)

***

[@ndigo/platform-web](../../README.md) / [ndigo-platform-web](../README.md) / createOnlineReconnectTrigger

# Function: createOnlineReconnectTrigger()

> **createOnlineReconnectTrigger**(): [`OnlineReconnectTrigger`](../interfaces/OnlineReconnectTrigger.md)

Creates the browser connectivity wiring for `WebSocketClient`:

- `online` — a signal mirroring `navigator.onLine`, updated by window
  `online`/`offline` events;
- a [ReconnectTrigger](#) that notifies subscribers on each
  **offline → online** transition, so a client in `reconnecting` retries
  immediately instead of waiting out its backoff.

## Returns

[`OnlineReconnectTrigger`](../interfaces/OnlineReconnectTrigger.md)

## Example

```ts
const trigger = createOnlineReconnectTrigger();
const chat = new WebSocketClient(url, { reconnectTrigger: trigger });
// …later, on teardown:
trigger.dispose();
```
