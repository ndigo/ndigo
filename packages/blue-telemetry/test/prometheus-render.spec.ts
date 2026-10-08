/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import {
    MetricSnapshot,
    getMetricSnapshotProvider,
    registerMetricSnapshotProvider,
    unregisterMetricSnapshotProvider,
} from '../src/metrics/metric-snapshot';
import { renderMetricJson } from '../src/metrics/metric-json';
import {
    renderPrometheusText,
    renderPrometheusAttributes,
    sanitizePrometheusName,
} from '../src/metrics/prometheus-text';

const counterSnapshot = (): MetricSnapshot => ({
    name: 'api.calls.count',
    description: 'Inbound API calls',
    unit: '',
    type: 'sum',
    points: [
        { attributes: { method: 'GET' }, value: { kind: 'scalar', value: 3 } },
        { attributes: { method: 'POST' }, value: { kind: 'scalar', value: 1 } },
    ],
});

const gaugeSnapshot = (): MetricSnapshot => ({
    name: 'db.pool.size',
    description: '',
    unit: '',
    type: 'gauge',
    points: [{ attributes: { name: 'write' }, value: { kind: 'scalar', value: 5 } }],
});

const histogramSnapshot = (): MetricSnapshot => ({
    name: 'http.server.request.duration',
    description: 'The duration of the server request.',
    unit: 's',
    type: 'histogram',
    points: [
        {
            attributes: { 'http.request.method': 'GET', 'http.response.status_code': 200 },
            value: {
                kind: 'histogram',
                count: 4,
                sum: 0.342,
                min: 0.021,
                max: 0.191,
                buckets: [
                    { count: 2, low: 0, high: 0.005 },
                    { count: 2, low: 0.005, high: 0.01 },
                ],
            },
        },
    ],
});

describe('renderPrometheusText', () => {
    it('renders an empty snapshot array as an empty document', () => {
        expect(renderPrometheusText([])).toBe('');
    });

    it('renders sum snapshots as counter blocks with # TYPE and # HELP', () => {
        const rendered = renderPrometheusText([counterSnapshot()]);

        expect(rendered).toBe(
            [
                '# TYPE api.calls.count counter',
                '# HELP api.calls.count Inbound API calls',
                'api.calls.count{method="GET"} 3',
                'api.calls.count{method="POST"} 1',
                '',
            ].join('\n')
        );
    });

    it('renders gauge snapshots as gauge blocks and omits HELP without a description', () => {
        const rendered = renderPrometheusText([gaugeSnapshot()]);

        expect(rendered).toBe(['# TYPE db.pool.size gauge', 'db.pool.size{name="write"} 5', ''].join('\n'));
    });

    it('projects histograms to a _count counter and a _sum gauge per point', () => {
        const rendered = renderPrometheusText([histogramSnapshot()]);

        expect(rendered).toBe(
            [
                '# TYPE http.server.request.duration_count counter',
                '# HELP http.server.request.duration_count The duration of the server request.',
                'http.server.request.duration_count{http.request.method="GET",http.response.status_code=200} 4',
                '# TYPE http.server.request.duration_sum gauge',
                'http.server.request.duration_sum{http.request.method="GET",http.response.status_code=200} 0.342',
                '',
            ].join('\n')
        );
    });

    it('skips the _sum gauge when the histogram carries no sum', () => {
        const snapshot: MetricSnapshot = {
            ...histogramSnapshot(),
            points: [
                {
                    attributes: {},
                    value: { kind: 'histogram', count: 2, sum: undefined, min: undefined, max: undefined, buckets: [] },
                },
            ],
        };

        const rendered = renderPrometheusText([snapshot]);

        expect(rendered).toContain('http.server.request.duration_count{} 2');
        expect(rendered).toContain('# TYPE http.server.request.duration_sum gauge');
        expect(rendered.split('\n').filter((line) => line.startsWith('http.server.request.duration_sum{'))).toEqual([]);
    });

    it('sorts attributes and escapes grammar-sensitive values', () => {
        const snapshot: MetricSnapshot = {
            name: 'x.count',
            description: 'n',
            unit: '',
            type: 'sum',
            points: [
                {
                    attributes: { z: 'last', a: 'va"l\\ue\nx', flag: true, dropped: ['array'] },
                    value: { kind: 'scalar', value: 1 },
                },
            ],
        };

        const rendered = renderPrometheusText([snapshot]);

        expect(rendered).toContain('x.count{a="va\\"l\\\\ue\\nx",flag=true,z="last"} 1');
    });

    it('sanitizes names invalid in the exposition grammar', () => {
        expect(sanitizePrometheusName('my-metric.count')).toBe('my_metric.count');
        expect(sanitizePrometheusName('9lives')).toBe('_9lives');
        expect(sanitizePrometheusName('ok.name')).toBe('ok.name');
    });
});

describe('renderPrometheusAttributes', () => {
    it('renders an empty attribute set as {}', () => {
        expect(renderPrometheusAttributes({})).toBe('{}');
    });
});

describe('renderMetricJson', () => {
    it('projects snapshots ordered by name with scalar and histogram points', () => {
        const view = renderMetricJson([histogramSnapshot(), gaugeSnapshot()]);

        expect(Object.keys(view.metrics).sort()).toEqual(['db.pool.size', 'http.server.request.duration']);
        expect(view.metrics['http.server.request.duration']).toEqual({
            type: 'histogram',
            unit: 's',
            description: 'The duration of the server request.',
            points: [
                {
                    attributes: { 'http.request.method': 'GET', 'http.response.status_code': 200 },
                    histogram: {
                        count: 4,
                        sum: 0.342,
                        min: 0.021,
                        max: 0.191,
                        buckets: [
                            { count: 2, low: 0, high: 0.005 },
                            { count: 2, low: 0.005, high: 0.01 },
                        ],
                    },
                },
            ],
        });
        expect(view.metrics['db.pool.size']).toEqual({
            type: 'gauge',
            unit: '',
            points: [{ attributes: { name: 'write' }, value: 5 }],
        });
    });
});

describe('metric snapshot provider registry', () => {
    it('returns undefined before any registration and after unregister', () => {
        unregisterMetricSnapshotProvider();

        expect(getMetricSnapshotProvider()).toBeUndefined();

        const provider = { snapshot: async (): Promise<readonly MetricSnapshot[]> => [counterSnapshot()] };
        registerMetricSnapshotProvider(provider);

        expect(getMetricSnapshotProvider()).toBe(provider);

        unregisterMetricSnapshotProvider();

        expect(getMetricSnapshotProvider()).toBeUndefined();
    });

    it('lets a later registration replace an earlier one', () => {
        unregisterMetricSnapshotProvider();

        const first = { snapshot: async (): Promise<readonly MetricSnapshot[]> => [] };
        const second = { snapshot: async (): Promise<readonly MetricSnapshot[]> => [] };
        registerMetricSnapshotProvider(first);
        registerMetricSnapshotProvider(second);

        expect(getMetricSnapshotProvider()).toBe(second);

        unregisterMetricSnapshotProvider();
    });
});
