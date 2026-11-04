[**@ndigo/telemetry v0.0.1**](../README.md)

***

[@ndigo/telemetry](../README.md) / FeatureMetricAggregatorProvider

# Class: FeatureMetricAggregatorProvider

The aggregator as a [MetricSnapshotProvider](../interfaces/MetricSnapshotProvider.md) (REV-003): projects the
tracked features into the snapshot model the `/metrics` endpoint serves.
Installed by `ManagementAutoConfiguration` as the *fallback* snapshot
source, so feature counters are served even when no telemetry pipeline
(pull reader) is configured — a registered current provider always wins.

Projection rules:
- counters → `sum` snapshots, gauges → `gauge` snapshots, both named
  `` `{feature}.{metric}` `` with empty attributes;
- durations → `histogram` snapshots (count/sum/min/max, no buckets — the
  raw samples are summarized, not bucketed), so the Prometheus view
  projects the `_count` counter + `_sum` gauge pair;
- name collisions within one snapshot (same feature + metric name across
  two kinds) keep the first entry — the wire views key by name, so a
  duplicate would clobber in the JSON view.

## Implements

- [`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md)

## Constructors

### Constructor

> **new FeatureMetricAggregatorProvider**(`aggregator`): `FeatureMetricAggregatorProvider`

#### Parameters

##### aggregator

[`FeatureMetricAggregator`](FeatureMetricAggregator.md)

The aggregator to project (bound by the caller).

#### Returns

`FeatureMetricAggregatorProvider`

## Methods

### snapshot()

> **snapshot**(): `Promise`\<readonly [`MetricSnapshot`](../interfaces/MetricSnapshot.md)[]\>

Projects every tracked feature into snapshot form.

#### Returns

`Promise`\<readonly [`MetricSnapshot`](../interfaces/MetricSnapshot.md)[]\>

The snapshots, feature-sorted.

#### Implementation of

[`MetricSnapshotProvider`](../interfaces/MetricSnapshotProvider.md).[`snapshot`](../interfaces/MetricSnapshotProvider.md#snapshot)
