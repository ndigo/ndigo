[**BlueJS Framework v0.0.1**](../../../README.md)

***

[BlueJS Framework](../../../modules.md) / [blue-management/src](../README.md) / HealthIndicator

# Interface: HealthIndicator

Defined in: packages/blue-management/src/health.ts:31

A component that reports the health of one subsystem.

## Properties

### name

> `readonly` **name**: `string`

Defined in: packages/blue-management/src/health.ts:33

The stable name of the subsystem (e.g. `'telemetry'`).

## Methods

### check()

> **check**(): [`HealthResult`](HealthResult.md) \| `Promise`\<[`HealthResult`](HealthResult.md)\>

Defined in: packages/blue-management/src/health.ts:39

Checks the subsystem health.

#### Returns

[`HealthResult`](HealthResult.md) \| `Promise`\<[`HealthResult`](HealthResult.md)\>

A promise resolving to the health result.
