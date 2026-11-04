[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / TaskStats

# Interface: TaskStats

Observable statistics for a registered task.

## Properties

### failures

> `readonly` **failures**: `number`

Runs that threw (exceptions are isolated per run — AD-20 D4).

***

### inFlight

> `readonly` **inFlight**: `boolean`

Whether the previous run is still in flight (single-flight — the next
tick skips while this is set).

***

### lastError

> `readonly` **lastError**: `Error` \| `null`

The most recent run error, if any.

***

### lastStartedAt

> `readonly` **lastStartedAt**: `Date` \| `null`

When the most recent run started, if any.

***

### runs

> `readonly` **runs**: `number`

Runs started.
