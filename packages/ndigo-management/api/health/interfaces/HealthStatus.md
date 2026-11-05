[**@ndigo/management v0.0.1**](../../README.md)

***

[@ndigo/management](../../README.md) / [health](../README.md) / HealthStatus

# Interface: HealthStatus

The aggregated health status served by `/health`.

## Properties

### components

> **components**: `Record`\<`string`, [`HealthResult`](HealthResult.md)\>

Per-indicator results keyed by indicator name.

***

### status

> **status**: [`HealthState`](../type-aliases/HealthState.md)

Overall state across all indicators.

***

### timestamp

> **timestamp**: `string`

ISO timestamp of the check.
