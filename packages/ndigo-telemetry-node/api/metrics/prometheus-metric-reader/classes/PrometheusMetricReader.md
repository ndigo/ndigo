[**@ndigo/telemetry-node v0.0.1**](../../../README.md)

***

[@ndigo/telemetry-node](../../../README.md) / [metrics/prometheus-metric-reader](../README.md) / PrometheusMetricReader

# Class: PrometheusMetricReader

A pull metric reader for the Prometheus text exposition format.

## Extends

- `MetricReader`

## Constructors

### Constructor

> **new PrometheusMetricReader**(`options?`): `PrometheusMetricReader`

#### Parameters

##### options?

`MetricReaderOptions`

#### Returns

`PrometheusMetricReader`

#### Inherited from

`MetricReader.constructor`

## Methods

### snapshot()

> **snapshot**(): `Promise`\<readonly `MetricSnapshot`[]\>

Collects the current aggregated snapshot of every tracked instrument.

#### Returns

`Promise`\<readonly `MetricSnapshot`[]\>

The projected snapshots; an empty array when the reader is not
  bound to a `MeterProvider` (constructed but never configured) or is
  shut down — the `/metrics` endpoint degrades to its "no metric
  source" document instead of a 500.
