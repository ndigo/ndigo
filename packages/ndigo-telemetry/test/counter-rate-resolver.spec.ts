/**
 * @module ndigo-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CounterRateResolver } from '../src/metrics/counter-rate-resolver';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';

describe('CounterRateResolver', () => {
    let aggregator: FeatureMetricAggregator;

    beforeEach(() => {
        aggregator = new FeatureMetricAggregator();
    });

    it('returns zero rates on first resolve', () => {
        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 4);
        aggregator.incrementCounter('account', 'account.routeHandledCount', 2);

        const resolver = new CounterRateResolver({
            aggregator,
        });

        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.routeHandledCount',
                feature: 'todo',
                ratePerSecond: 0,
            },
            {
                counterKey: 'account.routeHandledCount',
                feature: 'account',
                ratePerSecond: 0,
            },
        ]);
    });

    it('computes rates from counter deltas over elapsed time', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('account', 'account.routeHandledCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('account', 'account.routeHandledCount', 10);

        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'account.routeHandledCount',
                feature: 'account',
                ratePerSecond: 10,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('returns alerts only for rates exceeding configured thresholds', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('account', 'account.routeHandledCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
            thresholds: new Map([['account.routeHandledCount', 5]]),
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('account', 'account.routeHandledCount', 10);

        const alerts = resolver.resolveAlerts();

        expect(alerts).toEqual([
            {
                counterKey: 'account.routeHandledCount',
                feature: 'account',
                ratePerSecond: 10,
                threshold: 5,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('supports dynamic threshold updates and removals', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 7);
        resolver.setThreshold('todo.routeHandledCount', 5);

        const alertsWithThreshold = resolver.resolveAlerts();

        expect(alertsWithThreshold).toHaveLength(1);
        expect(resolver.removeThreshold('todo.routeHandledCount')).toBe(true);

        nowSpy.mockReturnValue(2000);
        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 7);

        const alertsWithoutThreshold = resolver.resolveAlerts();

        expect(alertsWithoutThreshold).toEqual([]);

        nowSpy.mockRestore();
    });

    it('resets previously captured snapshots', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 5);
        resolver.resolve();

        resolver.reset();

        nowSpy.mockReturnValue(2000);

        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.routeHandledCount',
                feature: 'todo',
                ratePerSecond: 0,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('returns zero rate when elapsed time is not positive', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(1000);

        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.routeHandledCount', 10);

        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.routeHandledCount',
                feature: 'todo',
                ratePerSecond: 0,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('averages rate across multiple samples with windowSize', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('todo', 'todo.requestCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
            windowSize: 3,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.requestCount', 10);
        resolver.resolve();

        nowSpy.mockReturnValue(2000);
        aggregator.incrementCounter('todo', 'todo.requestCount', 15);
        resolver.resolve();

        nowSpy.mockReturnValue(3000);
        aggregator.incrementCounter('todo', 'todo.requestCount', 12);
        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.requestCount',
                feature: 'todo',
                ratePerSecond: 37 / 3,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('evicts oldest samples beyond windowSize', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('account', 'account.eventCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
            windowSize: 2,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('account', 'account.eventCount', 5);
        resolver.resolve();

        nowSpy.mockReturnValue(2000);
        aggregator.incrementCounter('account', 'account.eventCount', 8);
        resolver.resolve();

        nowSpy.mockReturnValue(3000);
        aggregator.incrementCounter('account', 'account.eventCount', 11);
        const snapshots = resolver.resolve();

        expect(snapshots[0].ratePerSecond).toBe(9.5);

        nowSpy.mockRestore();
    });

    it('matches point-to-point behavior with windowSize 1', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('todo', 'todo.actionCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
            windowSize: 1,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.actionCount', 8);
        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.actionCount',
                feature: 'todo',
                ratePerSecond: 8,
            },
        ]);

        nowSpy.mockRestore();
    });

    it('resets sliding window history', () => {
        const nowSpy = vi.spyOn(Date, 'now');
        nowSpy.mockReturnValue(0);

        aggregator.incrementCounter('todo', 'todo.clickCount', 0);

        const resolver = new CounterRateResolver({
            aggregator,
            windowSize: 3,
        });

        resolver.resolve();

        nowSpy.mockReturnValue(1000);
        aggregator.incrementCounter('todo', 'todo.clickCount', 10);
        resolver.resolve();

        nowSpy.mockReturnValue(2000);
        aggregator.incrementCounter('todo', 'todo.clickCount', 15);
        resolver.resolve();

        resolver.reset();

        nowSpy.mockReturnValue(3000);
        const snapshots = resolver.resolve();

        expect(snapshots).toEqual([
            {
                counterKey: 'todo.clickCount',
                feature: 'todo',
                ratePerSecond: 0,
            },
        ]);

        nowSpy.mockRestore();
    });
});
