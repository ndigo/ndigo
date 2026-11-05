[**@ndigo/scheduler v0.0.1**](../../README.md)

***

[@ndigo/scheduler](../../README.md) / [scheduled](../README.md) / resolveScheduledSpec

# Function: resolveScheduledSpec()

> **resolveScheduledSpec**(`spec`): [`NormalizedScheduledSpec`](../../spec/interfaces/NormalizedScheduledSpec.md)

Normalizes and validates a [ScheduledSpec](../../spec/type-aliases/ScheduledSpec.md) into its canonical form.

Throws at decoration time for malformed cron expressions, durations, and
time zones — in any environment importing the module, the browser
included (AD-20 D5.2).

## Parameters

### spec

[`ScheduledSpec`](../../spec/type-aliases/ScheduledSpec.md)

The supplied schedule.

## Returns

[`NormalizedScheduledSpec`](../../spec/interfaces/NormalizedScheduledSpec.md)

The normalized schedule record.
