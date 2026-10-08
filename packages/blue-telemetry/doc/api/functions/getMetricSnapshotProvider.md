[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / getMetricSnapshotProvider

# Function: getMetricSnapshotProvider()

> **getMetricSnapshotProvider**(): [`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md) \| `undefined`

Returns the registered metric snapshot source, or `undefined` when none is
registered (no telemetry configured — the `/metrics` endpoint answers its
"no metric source" document).

## Returns

[`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md) \| `undefined`
