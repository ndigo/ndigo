[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / IntervalScheduleSpec

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

### maxRunTime?

> `optional` **maxRunTime?**: [`DurationValue`](../type-aliases/DurationValue.md)

Caps a run: the single-flight lock is released and a warning logged
when a run exceeds this duration (the task itself is not cancelled).
