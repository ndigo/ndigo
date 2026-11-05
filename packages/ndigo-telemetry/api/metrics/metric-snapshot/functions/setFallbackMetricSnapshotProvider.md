[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-snapshot](../README.md) / setFallbackMetricSnapshotProvider

# Function: setFallbackMetricSnapshotProvider()

> **setFallbackMetricSnapshotProvider**(`provider`): `void`

Sets or clears the fallback metric snapshot source (REV-003): the
aggregator-backed provider `ManagementAutoConfiguration` installs as the
no-telemetry default. `undefined` clears.

## Parameters

### provider

[`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md) \| `undefined`

The fallback provider, or `undefined` to clear.

## Returns

`void`
