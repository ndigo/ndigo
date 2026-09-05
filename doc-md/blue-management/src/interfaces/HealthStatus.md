[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthStatus

# Interface: HealthStatus

Defined in: [packages/blue-management/src/health.ts:130](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-130)

The aggregated health status served by `/health`.

## Properties

### status

> **status**: [`HealthState`](../type-aliases/HealthState.md)

Defined in: [packages/blue-management/src/health.ts:132](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-132)

Overall state across all indicators.

***

### components

> **components**: `Record`\<`string`, [`HealthResult`](HealthResult.md)\>

Defined in: [packages/blue-management/src/health.ts:134](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-134)

Per-indicator results keyed by indicator name.

***

### timestamp

> **timestamp**: `string`

Defined in: [packages/blue-management/src/health.ts:136](https://bitbucketdc-digital.jpmchase.net/scm/bluejs/blue/src/main/packages/blue-management/src/health.ts#lines-136)

ISO timestamp of the check.
