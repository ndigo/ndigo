[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session](../README.md) / nodeSocketSession

# Function: nodeSocketSession()

> **nodeSocketSession**(`transport`, `path`, `sources?`, `registry?`, `limits?`): [`SocketSession`](#)

Creates a [SocketSession](#) on top of a `ws` WebSocket connection.

## Parameters

### transport

`WebSocket`

The underlying `ws` WebSocket (or transport-compatible
  double in tests).

### path

`string`

The request path (for `session.path`).

### sources?

`SocketRequestSources` = `...`

Request sources captured from the upgrade request.

### registry?

`Pick`\<`SocketSessionRegistry`, `"join"` \| `"leave"`\> \| `null` = `null`

Optional session registry backing `join`/`leave`
  (AD-21 D5); when `null`, room membership is a no-op.

### limits?

[`ResolvedSocketLimits`](../interfaces/ResolvedSocketLimits.md) = `DEFAULT_SOCKET_LIMITS`

Transport bounds (frame payload, inbound queue cap).

## Returns

[`SocketSession`](#)

The session.
