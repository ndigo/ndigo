[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [schedule](../README.md) / ScheduleKind

# Type Alias: ScheduleKind

> **ScheduleKind** = `"cron"` \| `"fixedRate"` \| `"fixedDelay"`

A schedule's trigger kind. The engine anchors interval bookkeeping
differently per kind (start-anchored rate, end-anchored delay, and pure
time-sequence cron).
