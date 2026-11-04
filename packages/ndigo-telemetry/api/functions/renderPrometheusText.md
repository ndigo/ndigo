[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / renderPrometheusText

# Function: renderPrometheusText()

> **renderPrometheusText**(`snapshots`): `string`

Renders a snapshot array to a Prometheus text document. An empty snapshot
array renders an empty document.

## Parameters

### snapshots

readonly [`MetricSnapshot`](../interfaces/MetricSnapshot.md)[]

The snapshot array to render.

## Returns

`string`

The exposition-format document (trailing newline, never a bare join).
