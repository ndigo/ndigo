/**
 */
import { describe, expect, test, afterEach } from 'vitest';
import { metrics } from '@opentelemetry/api';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { PrometheusMetricReader } from '../src/metrics/prometheus-metric-reader';

describe('PrometheusMetricReader', () => {
    afterEach(() => {
        metrics.disable();
    });

    test('answers an empty snapshot when not bound to a meter provider (AD-77 D-2)', async () => {
        const reader = new PrometheusMetricReader();

        expect(await reader.snapshot()).toEqual([]);
    });

    test('projects counters, gauges and explicit histograms from the meter provider (AD-77 D-2/D-6)', async () => {
        const reader = new PrometheusMetricReader();
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [reader] }));
        const meter = metrics.getMeter('prometheus-spec');

        meter.createCounter('api.calls.count').add(3, { method: 'GET' });
        meter.createGauge('db.pool.size').record(5);
        const duration = meter.createHistogram('http.server.request.duration', {
            unit: 's',
            advice: { explicitBucketBoundaries: [0.005, 0.01] },
        });
        duration.record(0.001, { 'http.request.method': 'POST', 'http.response.status_code': 200 });
        duration.record(0.05, { 'http.request.method': 'GET', 'http.response.status_code': 200 });

        const snapshots = await reader.snapshot();
        const byName = new Map(snapshots.map((snapshot) => [snapshot.name, snapshot]));

        expect(byName.get('api.calls.count')).toEqual({
            name: 'api.calls.count',
            description: '',
            unit: '',
            type: 'sum',
            points: [{ attributes: { method: 'GET' }, value: { kind: 'scalar', value: 3 } }],
        });
        expect(byName.get('db.pool.size')).toMatchObject({
            type: 'gauge',
            points: [{ value: { kind: 'scalar', value: 5 } }],
        });

        const histogram = byName.get('http.server.request.duration');
        expect(histogram).toBeDefined();
        if (!histogram) {
            return;
        }
        expect(histogram.type).toBe('histogram');
        expect(histogram.unit).toBe('s');
        expect(histogram.points).toHaveLength(2);

        const sum = histogram.points.reduce(
            (total, point) => total + (point.value.kind === 'histogram' ? (point.value.sum ?? 0) : 0),
            0
        );
        expect(sum).toBeCloseTo(0.051, 12);

        const count = histogram.points.reduce(
            (total, point) => total + (point.value.kind === 'histogram' ? point.value.count : 0),
            0
        );
        expect(count).toBe(2);

        // The aggregation is explicit-bucket: each point carries the full boundary
        // set (empty buckets included), and the recorded values land in their
        // semconv buckets.
        const post = histogram.points.find((point) => point.attributes['http.request.method'] === 'POST');
        expect(post?.value).toMatchObject({
            kind: 'histogram',
            count: 1,
            min: 0.001,
            max: 0.001,
            buckets: [
                { count: 1, low: Number.NEGATIVE_INFINITY, high: 0.005 },
                { count: 0, low: 0.005, high: 0.01 },
                { count: 0, low: 0.01, high: Number.POSITIVE_INFINITY },
            ],
        });
        const get = histogram.points.find((point) => point.attributes['http.request.method'] === 'GET');
        expect(get?.value).toMatchObject({
            kind: 'histogram',
            count: 1,
            min: 0.05,
            max: 0.05,
            buckets: [
                { count: 0, low: Number.NEGATIVE_INFINITY, high: 0.005 },
                { count: 0, low: 0.005, high: 0.01 },
                { count: 1, low: 0.01, high: Number.POSITIVE_INFINITY },
            ],
        });
    });
});
