[**@ndigo/socket v0.0.1**](../README.md)

***

[@ndigo/socket](../README.md) / ReconnectPolicy

# Interface: ReconnectPolicy

Exponential backoff policy for unexpected-close reconnects (AD-22 D3).

## Properties

### baseMs

> **baseMs**: `number`

First delay in ms (default `1000`).

***

### jitter

> **jitter**: `number`

Random jitter fraction, `0`–`1` (default `0.2` = ±20%).

***

### maxMs

> **maxMs**: `number`

Delay ceiling in ms (default `30_000`).
