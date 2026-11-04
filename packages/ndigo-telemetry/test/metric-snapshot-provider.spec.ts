/**
 * The metric snapshot source registry's fallback semantics (REV-003) and the
 * aggregator-backed provider projection.
 * @module ndigo-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, afterEach } from 'vitest';
import { FeatureMetricAggregator, FeatureMetricAggregatorProvider } from '../src/metrics/feature-metric-aggregator';
import {
    getMetricSnapshotProvider,
    registerMetricSnapshotProvider,
    setFallbackMetricSnapshotProvider,
    unregisterMetricSnapshotProvider,
    type MetricSnapshot,
    type MetricSnapshotProvider,
} from '../src/metrics/metric-snapshot';

describe('metric snapshot source registry (REV-003)', () => {
    const makeProvider = (): MetricSnapshotProvider => ({
        snapshot: async (): Promise<readonly MetricSnapshot[]> => [],
    });

    afterEach(() => {
        unregisterMetricSnapshotProvider();
        setFallbackMetricSnapshotProvider(undefined);
    });

    test('the current slot wins over the fallback', () => {
        const fallback = makeProvider();
        const current = makeProvider();
        setFallbackMetricSnapshotProvider(fallback);
        registerMetricSnapshotProvider(current);
        expect(getMetricSnapshotProvider()).toBe(current);
    });

    test('unregistering the current slot falls back instead of returning undefined', () => {
        const fallback = makeProvider();
        setFallbackMetricSnapshotProvider(fallback);
        registerMetricSnapshotProvider(makeProvider());
        unregisterMetricSnapshotProvider();
        expect(getMetricSnapshotProvider()).toBe(fallback);
    });

    test('with no current and no fallback the source is undefined', () => {
        expect(getMetricSnapshotProvider()).toBeUndefined();
    });

    test('clearing the fallback restores undefined', () => {
        setFallbackMetricSnapshotProvider(makeProvider());
        setFallbackMetricSnapshotProvider(undefined);
        expect(getMetricSnapshotProvider()).toBeUndefined();
    });
});

describe('FeatureMetricAggregatorProvider', () => {
    test('projects counters, gauges and durations in one snapshot stream', async () => {
        const aggregator = new FeatureMetricAggregator();
        aggregator.incrementCounter('gate', 'opens', 2);
        aggregator.setGauge('gate', 'poolSize', 4);
        aggregator.recordDuration('gate', 'latencyMs', 150);
        aggregator.recordDuration('gate', 'latencyMs', 250);

        const snapshots = await new FeatureMetricAggregatorProvider(aggregator).snapshot();

        const byName = new Map(snapshots.map((snapshot) => [snapshot.name, snapshot] as const));
        expect(byName.get('gate.opens')).toMatchObject({
            type: 'sum',
            points: [{ attributes: {}, value: { kind: 'scalar', value: 2 } }],
        });
        expect(byName.get('gate.poolSize')).toMatchObject({
            type: 'gauge',
            points: [{ attributes: {}, value: { kind: 'scalar', value: 4 } }],
        });
        const latency = byName.get('gate.latencyMs');
        expect(latency?.type).toBe('histogram');
        expect(latency?.points[0]?.value).toMatchObject({
            kind: 'histogram',
            count: 2,
            sum: 400, // mean 200 × 2 samples
            min: 150,
            max: 250,
            buckets: [],
        });
    });

    test('a counter named like a gauge keeps the first entry (wire views key by name)', async () => {
        const aggregator = new FeatureMetricAggregator();
        aggregator.setGauge('gate', 'same', 1);
        aggregator.incrementCounter('gate', 'same', 9); // collision: gauge wins

        const snapshots = await new FeatureMetricAggregatorProvider(aggregator).snapshot();

        expect(snapshots).toHaveLength(1);
        expect(snapshots[0]?.type).toBe('gauge');
        expect(snapshots[0]?.points[0]?.value).toEqual({ kind: 'scalar', value: 1 });
    });

    test('empty aggregators project nothing', async () => {
        expect(await new FeatureMetricAggregatorProvider(new FeatureMetricAggregator()).snapshot()).toEqual([]);
    });
});
