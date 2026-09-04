[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthStatus

# Interface: HealthStatus

Defined in: packages/blue-management/src/health.ts:117

The aggregated health status served by `/health`.

## Properties

### status

> **status**: [`HealthState`](../type-aliases/HealthState.md)

Defined in: packages/blue-management/src/health.ts:119

Overall state across all indicators.

***

### components

> **components**: `Record`\<`string`, [`HealthResult`](HealthResult.md)\>

Defined in: packages/blue-management/src/health.ts:121

Per-indicator results keyed by indicator name.

***

### timestamp

> **timestamp**: `string`

Defined in: packages/blue-management/src/health.ts:123

ISO timestamp of the check.
