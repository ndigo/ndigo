[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / IntervalScheduleSpec

# Interface: IntervalScheduleSpec

An interval trigger — `fixedRate` (period measured from run start) or
`fixedDelay` (period measured from run end). Exactly one is required.

## Properties

### fixedDelay?

> `optional` **fixedDelay?**: [`DurationValue`](../type-aliases/DurationValue.md)

Run every N milliseconds, starting the interval when a run finishes.

***

### fixedRate?

> `optional` **fixedRate?**: [`DurationValue`](../type-aliases/DurationValue.md)

Run every N milliseconds, starting the interval when a run starts.

***

### lock?

> `optional` **lock?**: `string`

Distributed lock key (AD-73) — see the cron spec's `lock` for the
contract; the two spec forms share the same lock option set.

***

### lockTtl?

> `optional` **lockTtl?**: [`DurationValue`](../type-aliases/DurationValue.md)

Lease duration for the acquired lock (default 60 s).

***

### lockWait?

> `optional` **lockWait?**: [`DurationValue`](../type-aliases/DurationValue.md)

How long to wait for a contended lock before skipping (see cron spec).

***

### lockWaitStep?

> `optional` **lockWaitStep?**: [`DurationValue`](../type-aliases/DurationValue.md)

Poll interval while waiting for a contended lock (default 100 ms).

***

### maxRunTime?

> `optional` **maxRunTime?**: [`DurationValue`](../type-aliases/DurationValue.md)

Caps a run: the single-flight lock is released and a warning logged
when a run exceeds this duration (the task itself is not cancelled).
