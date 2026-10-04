[**@blue/resilience v0.0.1**](../README.md)

***

[@blue/resilience](../README.md) / ExponentialBackoffOptions

# Interface: ExponentialBackoffOptions

Options for [exponentialBackoff](../functions/exponentialBackoff.md).

## Properties

### factor?

> `optional` **factor?**: `number`

Per-attempt growth factor; defaults to `2`.

***

### initialMs

> **initialMs**: `number`

Delay of the first retry attempt, in milliseconds.

***

### maxMs?

> `optional` **maxMs?**: `number`

Upper bound for any delay; growth is capped at this value.
