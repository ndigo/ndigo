[**@blue/scheduler v0.0.1**](../README.md)

***

[@blue/scheduler](../README.md) / CronScheduleSpec

# Interface: CronScheduleSpec

A cron trigger with optional time zone and run-time cap.

## Properties

### cron

> **cron**: `string`

Cron expression (croner syntax — 5, 6, or 7 fields auto-detected).

***

### maxRunTime?

> `optional` **maxRunTime?**: [`DurationValue`](../type-aliases/DurationValue.md)

Caps a run: the single-flight lock is released and a warning logged
when a run exceeds this duration (the task itself is not cancelled).

***

### timeZone?

> `optional` **timeZone?**: `string`

IANA time-zone identifier the schedule is evaluated in.
