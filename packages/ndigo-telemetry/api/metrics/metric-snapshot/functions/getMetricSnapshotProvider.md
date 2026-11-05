[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-snapshot](../README.md) / getMetricSnapshotProvider

# Function: getMetricSnapshotProvider()

> **getMetricSnapshotProvider**(): [`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md) \| `undefined`

Returns the metric snapshot source: the registered current provider when
present, else the fallback, else `undefined` (no telemetry configured and
no auto-configuration — the `/metrics` endpoint answers its "no metric
source" document).

## Returns

[`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md) \| `undefined`
