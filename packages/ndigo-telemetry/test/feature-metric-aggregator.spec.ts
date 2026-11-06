/**
 */
import { describe, expect, it } from 'vitest';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';

describe('FeatureMetricAggregator', () => {
    it('increments counters per feature and metric name', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.incrementCounter('todo', 'todo.mount');
        aggregator.incrementCounter('todo', 'todo.mount', 2);
        aggregator.incrementCounter('account', 'account.mount');

        const todoMetrics = aggregator.getFeatureMetrics('todo');
        const accountMetrics = aggregator.getFeatureMetrics('account');

        expect(todoMetrics?.counters.get('todo.mount')).toBe(3);
        expect(accountMetrics?.counters.get('account.mount')).toBe(1);
    });

    it('sets gauges and exposes feature names', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.setGauge('todo', 'todo.activeRelays', 2);
        aggregator.setGauge('todo', 'todo.blockedRelays', 1);

        const metrics = aggregator.getFeatureMetrics('todo');

        expect(metrics?.gauges.get('todo.activeRelays')).toBe(2);
        expect(metrics?.gauges.get('todo.blockedRelays')).toBe(1);
        expect(aggregator.featureNames).toEqual(['todo']);
    });

    it('supports clearing feature metrics and full reset', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.incrementCounter('todo', 'todo.mount');
        aggregator.incrementCounter('account', 'account.mount');

        expect(aggregator.clearFeature('account')).toBe(true);
        expect(aggregator.getFeatureMetrics('account')).toBeUndefined();

        aggregator.clear();
        expect(aggregator.featureNames).toEqual([]);
    });

    it('records duration samples and returns statistical summary', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.recordDuration('todo', 'todo.routeLatency', 100);
        aggregator.recordDuration('todo', 'todo.routeLatency', 200);
        aggregator.recordDuration('todo', 'todo.routeLatency', 150);
        aggregator.recordDuration('todo', 'todo.routeLatency', 300);
        aggregator.recordDuration('todo', 'todo.routeLatency', 250);

        const metrics = aggregator.getFeatureMetrics('todo');
        const summary = metrics?.durations.get('todo.routeLatency');

        expect(summary).toEqual({
            count: 5,
            min: 100,
            max: 300,
            mean: 200,
            p50: 200,
        });
    });

    it('computes correct p50 for even and odd sample counts', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.recordDuration('account', 'account.queryLatency', 10);
        aggregator.recordDuration('account', 'account.queryLatency', 20);
        aggregator.recordDuration('account', 'account.queryLatency', 30);

        const oddMetrics = aggregator.getFeatureMetrics('account');
        const oddSummary = oddMetrics?.durations.get('account.queryLatency');

        expect(oddSummary?.p50).toBe(20);

        aggregator.recordDuration('account', 'account.queryLatency', 40);

        const evenMetrics = aggregator.getFeatureMetrics('account');
        const evenSummary = evenMetrics?.durations.get('account.queryLatency');

        expect(evenSummary?.p50).toBe(25);
    });

    it('respects maxDurationSamples option and evicts oldest samples', () => {
        const aggregator = new FeatureMetricAggregator({
            maxDurationSamples: 3,
        });

        aggregator.recordDuration('todo', 'todo.latency', 10);
        aggregator.recordDuration('todo', 'todo.latency', 20);
        aggregator.recordDuration('todo', 'todo.latency', 30);
        aggregator.recordDuration('todo', 'todo.latency', 40);
        aggregator.recordDuration('todo', 'todo.latency', 50);

        const metrics = aggregator.getFeatureMetrics('todo');
        const summary = metrics?.durations.get('todo.latency');

        expect(summary?.count).toBe(3);
        expect(summary?.min).toBe(30);
        expect(summary?.max).toBe(50);
    });

    it('rejects negative duration values', () => {
        const aggregator = new FeatureMetricAggregator();

        expect(() => aggregator.recordDuration('todo', 'todo.latency', -10)).toThrow('Duration must be non-negative');
    });

    it('rejects non-finite duration values', () => {
        const aggregator = new FeatureMetricAggregator();

        expect(() => aggregator.recordDuration('todo', 'todo.latency', NaN)).toThrow(
            'Feature metric value must be a finite number'
        );

        expect(() => aggregator.recordDuration('todo', 'todo.latency', Infinity)).toThrow(
            'Feature metric value must be a finite number'
        );
    });

    it('clears duration samples when feature is cleared', () => {
        const aggregator = new FeatureMetricAggregator();

        aggregator.recordDuration('todo', 'todo.latency', 100);
        aggregator.recordDuration('todo', 'todo.latency', 200);

        expect(aggregator.clearFeature('todo')).toBe(true);
        expect(aggregator.getFeatureMetrics('todo')).toBeUndefined();
    });
});
