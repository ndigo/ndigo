[**@blue/platform-web v0.0.1**](../../README.md)

***

[@blue/platform-web](../../README.md) / [blue-platform-web](../README.md) / RetryOnOfflineConfig

# Interface: RetryOnOfflineConfig

Configuration options for the RetryOnOfflineInterceptor.

## Properties

### enableLogging?

> `optional` **enableLogging?**: `boolean`

Whether to log retry attempts. Defaults to `false`.

***

### maxRetries?

> `optional` **maxRetries?**: `number`

Maximum number of retry attempts when offline. Defaults to 5.

***

### maxRetryInterval?

> `optional` **maxRetryInterval?**: `number`

Upper bound (in milliseconds) on the per-entry exponential backoff
interval (`retryInterval * 2^attempt`). Defaults to 30000 (30 s).

***

### queueCap?

> `optional` **queueCap?**: `number`

Maximum number of entries that may be queued for offline retry.
Defaults to 100.

Overflow policy (documented, fail-fast): when the queue is full, the
NEWEST request is rejected with a `FrameworkError` rather than growing
the queue without bound — silent unbounded growth would let an offline
burst accumulate unbounded memory and delay recovery. Raise this cap
(or treat the error as a client-side 503) when bursts legitimately
exceed it. The oldest entries are always kept.

***

### retryInterval?

> `optional` **retryInterval?**: `number`

Base interval in milliseconds used for the offline retry cadence and as
the first (attempt-0) per-entry backoff. Defaults to 3000.
