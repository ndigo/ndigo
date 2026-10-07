[**@blue/resilience v0.0.1**](../README.md)

***

[@blue/resilience](../README.md) / ExponentialBackoffOptions

# Interface: ExponentialBackoffOptions

Options for [exponentialBackoff](../functions/exponentialBackoff.md).

## Properties

### factor?

> `optional` **factor?**: `number`

Per-attempt growth factor; defaults to `2`. Must be a finite, positive
number — invalid values fail loudly at construction.

***

### initialMs

> **initialMs**: `number`

Delay of the first retry attempt, in milliseconds. Must be a finite,
non-negative number — invalid values fail loudly at construction.

***

### jitter?

> `optional` **jitter?**: `number`

Random jitter fraction, `0`–`1` (default `0` = deterministic). Each
delay is multiplied by `1 - jitter + random * 2 * jitter`, i.e. spread
uniformly over ±`jitter` around the computed value, then capped at
`maxMs`. Jitter de-synchronizes retries from many clients after a
shared outage.

***

### maxMs?

> `optional` **maxMs?**: `number`

Upper bound for any delay; growth is capped at this value. Must be a
finite, non-negative number when provided.
