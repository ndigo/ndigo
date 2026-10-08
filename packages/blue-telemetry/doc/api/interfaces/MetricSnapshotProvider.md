[**@blue/telemetry v0.0.1**](../README.md)

***

[@blue/telemetry](../README.md) / MetricSnapshotProvider

# Interface: MetricSnapshotProvider

A source of metric snapshots. Implemented by the SDK-backed reader in
`@blue/telemetry-node`; read by the management `/metrics` controller.

## Methods

### snapshot()

> **snapshot**(): `Promise`\<readonly [`MetricSnapshot`](MetricSnapshot.md)[]\>

Collects the current aggregated snapshot of every tracked instrument.

#### Returns

`Promise`\<readonly [`MetricSnapshot`](MetricSnapshot.md)[]\>
