[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-snapshot](../README.md) / registerMetricSnapshotProvider

# Function: registerMetricSnapshotProvider()

> **registerMetricSnapshotProvider**(`provider`): `void`

Registers the process's metric snapshot source, replacing any previous
registration (hot reload, tests).

## Parameters

### provider

[`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md)

The provider to register (e.g. a bound `PrometheusMetricReader`).

## Returns

`void`
