[**@ndigo/platform-node v0.0.1**](../../README.md)

***

[@ndigo/platform-node](../../README.md) / [node-socket-session-registry](../README.md) / SocketFanoutEvent

# Type Alias: SocketFanoutEvent

> **SocketFanoutEvent** = `object`

Fan-out event — emitted once per `broadcast`/`broadcastTo` that reached at
least one session, after the payload has been serialized for the wire
(exactly once). Telemetry and logging consume this instead of
re-serializing the payload to measure it — the same payload would
otherwise be JSON-encoded twice per broadcast. A fan-out to an empty
path/room (or one whose members have all closed) sends nothing and emits
nothing.

## Properties

### bytes

> **bytes**: `number`

Wire size of the serialized payload (UTF-8 octets for text frames,
raw length for binary).

***

### key

> **key**: `string`

The path or room name that was targeted.

***

### recipients

> **recipients**: `number`

Sessions the payload was handed to (closed ones excluded).

***

### scope

> **scope**: `"path"` \| `"room"`

Which index fanned out: the endpoint path or a named room.
