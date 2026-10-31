[**@blue/platform-node v0.0.1**](../../README.md)

***

[@blue/platform-node](../../README.md) / [blue-platform-node](../README.md) / resolveSocketLimits

# Function: resolveSocketLimits()

> **resolveSocketLimits**(`limits?`, `env?`): [`ResolvedSocketLimits`](../interfaces/ResolvedSocketLimits.md)

Validates and resolves socket limits from user options and the
environment, filling defaults (mirrors `resolveHTTPRequestLimits`).

- `BLUE_SOCKET_MAX_PAYLOAD_BYTES` — max frame payload (default 1 MiB)
- `BLUE_SOCKET_MAX_QUEUED_MESSAGES` — inbound queue cap (default 1024)
- `BLUE_SOCKET_MAX_QUEUED_BYTES` — inbound byte budget, `0` disables
  (default 4 MiB)
- `BLUE_SOCKET_MAX_BUFFERED_BYTES` — outbound watermark, `0` disables
  (default 1 MiB)
- `BLUE_SOCKET_ON_OVERFLOW` — `close` (default, 1013) or `drop`

Invalid values throw a `RangeError` (fail fast at boot).

## Parameters

### limits?

[`SocketLimits`](../interfaces/SocketLimits.md) = `{}`

Explicit limits (win over environment).

### env?

`Readonly`\<`Record`\<`string`, `string` \| `undefined`\>\> = `process.env`

Environment to read (defaults to `process.env`).

## Returns

[`ResolvedSocketLimits`](../interfaces/ResolvedSocketLimits.md)

Resolved socket limits.
