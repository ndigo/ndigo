[**@blue/jobs v0.0.1**](../README.md)

***

[@blue/jobs](../README.md) / startJobSpan

# Function: startJobSpan()

> **startJobSpan**(`job`): [`JobSpan`](../interfaces/JobSpan.md)

Opens an INTERNAL span for one job execution
(`jobs.job.<type>`, attributes `job.id`, `job.type`, `job.attempt`).

The dispatcher/scheduler pattern: explicit `end()` so the runner controls
when the outcome is known, and `job.duration_ms` for the recorded attempt.

## Parameters

### job

`Pick`\<[`JobRecord`](../interfaces/JobRecord.md), `"id"` \| `"type"` \| `"attempts"`\>

The claimed job this execution belongs to.

## Returns

[`JobSpan`](../interfaces/JobSpan.md)

The span handle the runner ends.
