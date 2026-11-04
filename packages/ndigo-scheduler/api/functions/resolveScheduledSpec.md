[**@ndigo/scheduler v0.0.1**](../README.md)

***

[@ndigo/scheduler](../README.md) / resolveScheduledSpec

# Function: resolveScheduledSpec()

> **resolveScheduledSpec**(`spec`): [`NormalizedScheduledSpec`](../interfaces/NormalizedScheduledSpec.md)

Normalizes and validates a [ScheduledSpec](../type-aliases/ScheduledSpec.md) into its canonical form.

Throws at decoration time for malformed cron expressions, durations, and
time zones — in any environment importing the module, the browser
included (AD-20 D5.2).

## Parameters

### spec

[`ScheduledSpec`](../type-aliases/ScheduledSpec.md)

The supplied schedule.

## Returns

[`NormalizedScheduledSpec`](../interfaces/NormalizedScheduledSpec.md)

The normalized schedule record.
