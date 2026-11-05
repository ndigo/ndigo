[**@ndigo/telemetry v0.0.1**](../../../README.md)

***

[@ndigo/telemetry](../../../README.md) / [metrics/metric-snapshot](../README.md) / MetricSnapshotProvider

# Interface: MetricSnapshotProvider

A source of metric snapshots. Implemented by the SDK-backed reader in
`@ndigo/telemetry-node`; read by the management `/metrics` controller.

## Methods

### snapshot()

> **snapshot**(): `Promise`\<readonly [`MetricSnapshot`](MetricSnapshot.md)[]\>

Collects the current aggregated snapshot of every tracked instrument.

#### Returns

`Promise`\<readonly [`MetricSnapshot`](MetricSnapshot.md)[]\>
