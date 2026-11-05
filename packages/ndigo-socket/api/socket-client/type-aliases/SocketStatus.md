[**@ndigo/socket v0.0.1**](../../README.md)

***

[@ndigo/socket](../../README.md) / [socket-client](../README.md) / SocketStatus

# Type Alias: SocketStatus

> **SocketStatus** = `"connecting"` \| `"open"` \| `"reconnecting"` \| `"closed"`

Connection lifecycle states.

- `connecting` — initial connect or a reconnect attempt in flight.
- `open` — messages flow both ways.
- `reconnecting` — the peer dropped unexpectedly; a retry is scheduled.
- `closed` — deliberate close (or `reconnect: null` after a drop);
  terminal, never reconnects (AD-22 D3).
