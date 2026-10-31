[**@blue/management v0.0.1**](../README.md)

***

[@blue/management](../README.md) / HealthIndicator

# Interface: HealthIndicator

A component that reports the health of one subsystem.

## Properties

### name

> `readonly` **name**: `string`

The stable name of the subsystem (e.g. `'telemetry'`).

## Methods

### check()

> **check**(): [`HealthResult`](HealthResult.md) \| `Promise`\<[`HealthResult`](HealthResult.md)\>

Checks the subsystem health.

#### Returns

[`HealthResult`](HealthResult.md) \| `Promise`\<[`HealthResult`](HealthResult.md)\>

A promise resolving to the health result.
