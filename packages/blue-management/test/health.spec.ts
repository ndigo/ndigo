// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { HealthRegistry, HealthIndicator, HealthResult } from '../src/health';
import { TelemetryHealthIndicator } from '../src/telemetry-health-indicator';
import { FeatureMetricAggregator } from '@blue/telemetry';

describe('HealthRegistry', () => {
    const up: HealthIndicator = { name: 'up', check: (): HealthResult => ({ status: 'UP' }) };
    const down: HealthIndicator = { name: 'down', check: (): HealthResult => ({ status: 'DOWN', details: { why: 'x' } }) };

    test('aggregates UP when all indicators are UP', async () => {
        const registry = new HealthRegistry().register(up);
        const status = await registry.checkAll();
        expect(status.status).toBe('UP');
        expect(status.components['up']).toEqual({ status: 'UP' });
        expect(status.timestamp).toBeTruthy();
    });

    test('aggregates DOWN when any indicator is DOWN', async () => {
        const registry = new HealthRegistry().register(up).register(down);
        const status = await registry.checkAll();
        expect(status.status).toBe('DOWN');
        expect(status.components['down'].details).toEqual({ why: 'x' });
    });

    test('a throwing indicator is reported DOWN', async () => {
        const boom: HealthIndicator = {
            name: 'boom',
            check: () => {
                throw new Error('kaboom');
            },
        };
        const registry = new HealthRegistry().register(boom).register(up);
        const status = await registry.checkAll();
        expect(status.status).toBe('DOWN');
        expect(status.components['boom'].details).toEqual({ error: 'kaboom' });
    });

    test('unregister removes an indicator', async () => {
        const registry = new HealthRegistry().register(up).register(down);
        expect(registry.unregister('down')).toBe(true);
        expect((await registry.checkAll()).components['down']).toBeUndefined();
    });
});

describe('TelemetryHealthIndicator', () => {
    test('reports UP with feature count when an aggregator is wired', () => {
        const aggregator = new FeatureMetricAggregator();
        aggregator.incrementCounter('todo', 'mountCount', 2);
        const result = new TelemetryHealthIndicator(aggregator).check();
        expect(result.status).toBe('UP');
        expect(result.details).toEqual({ features: 1 });
    });

    test('reports DOWN when no aggregator is wired', () => {
        const result = new TelemetryHealthIndicator(undefined).check();
        expect(result.status).toBe('DOWN');
        expect(result.details).toMatchObject({ reason: 'No FeatureMetricAggregator wired' });
    });
});