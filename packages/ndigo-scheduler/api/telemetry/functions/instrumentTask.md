[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [telemetry](../README.md) / instrumentTask

# Function: instrumentTask()

> **instrumentTask**(`task`): [`ScheduledTaskDefinition`](../../task-scheduler/interfaces/ScheduledTaskDefinition.md)

Wraps a task's run with an OpenTelemetry span.

One INTERNAL span per run (`scheduler.task.<name>`) carrying the task
name, outcome, and duration — the dispatcher/SSE instrumentation pattern
(`startSpan` + explicit end, so async rejection is handled deterministically).
The error is rethrown so the engine still records `failures`.

## Parameters

### task

[`ScheduledTaskDefinition`](../../task-scheduler/interfaces/ScheduledTaskDefinition.md)

The task to instrument.

## Returns

[`ScheduledTaskDefinition`](../../task-scheduler/interfaces/ScheduledTaskDefinition.md)

A task whose `run` opens and closes the span.
