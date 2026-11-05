[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session-registry](../README.md) / resolveSocketRegistryOptions

# Function: resolveSocketRegistryOptions()

> **resolveSocketRegistryOptions**(`env?`): [`NodeSocketSessionRegistryOptions`](../interfaces/NodeSocketSessionRegistryOptions.md)

Validates and resolves socket registry options from the environment,
filling defaults (mirrors `resolveHTTPRequestLimits`).

- `NDIGO_SOCKET_HEARTBEAT_INTERVAL_MS` — ping interval; `0` disables the
  heartbeat (D6), default `30000`.
- `NDIGO_SOCKET_IDLE_TIMEOUT_MS` — silent-session reap threshold,
  default `60000`.

Invalid values throw a `RangeError` (fail fast at boot).

## Parameters

### env?

`Readonly`\<`Record`\<`string`, `string` \| `undefined`\>\> = `process.env`

Environment to read (defaults to `process.env`).

## Returns

[`NodeSocketSessionRegistryOptions`](../interfaces/NodeSocketSessionRegistryOptions.md)

Resolved registry options.
