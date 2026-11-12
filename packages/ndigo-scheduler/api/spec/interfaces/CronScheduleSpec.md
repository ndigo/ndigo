[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [spec](../README.md) / CronScheduleSpec

# Interface: CronScheduleSpec

A cron trigger with optional time zone and run-time cap.

## Properties

### cron

> **cron**: `string`

Cron expression (croner syntax — 5, 6, or 7 fields auto-detected).

***

### lock?

> `optional` **lock?**: `string`

Distributed lock key (AD-73): the runner acquires the named lock
before each run and releases it after (finally-style), so only one
node executes this schedule at a time. Requires a `lockDriver` entry
(in-process or `@ndigo/redis/locks`).

***

### lockTtl?

> `optional` **lockTtl?**: [`DurationValue`](../type-aliases/DurationValue.md)

Lease duration for the acquired lock (default 60 s). Must cover the
whole run — a lease that lapses mid-run lets another node take over
(at-least-once posture, like the job driver).

***

### lockWait?

> `optional` **lockWait?**: [`DurationValue`](../type-aliases/DurationValue.md)

How long the runner waits for a contended lock before skipping the
fire. Omitted (default): skip immediately on contention.

***

### lockWaitStep?

> `optional` **lockWaitStep?**: [`DurationValue`](../type-aliases/DurationValue.md)

Poll interval while waiting for a contended lock (default 100 ms).

***

### maxRunTime?

> `optional` **maxRunTime?**: [`DurationValue`](../type-aliases/DurationValue.md)

Caps a run: the single-flight lock is released and a warning logged
when a run exceeds this duration (the task itself is not cancelled).

***

### timeZone?

> `optional` **timeZone?**: `string`

IANA time-zone identifier the schedule is evaluated in.
