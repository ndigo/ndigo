import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import '@tsmetadata/polyfill';
import { counted, getCounted, hasCounted } from '../src/metrics/decorators';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';
import { getTraced, hasTraced, traced } from '../src/trace/decorators';
import { CountedInstrumentation } from '../src/instrumentation/counted';
import { CountedRegistry } from '../src/metrics/_registry';

describe('telemetry decorators (TC39)', () => {
    let instrumentation: CountedInstrumentation;

    beforeEach(() => {
        instrumentation = new CountedInstrumentation();
        instrumentation.enable();
    });

    afterEach(() => {
        instrumentation.disable();
        CountedRegistry.clear();
    });

    class TraceAsyncService {
        @traced()
        async runAsync(value: string): Promise<string> {
            return value;
        }
    }

    class TraceSyncService {
        @traced('custom-span')
        runSync(value: number): number {
            return value + 1;
        }
    }

    class CountedService {
        @counted('service.invocations')
        invoke(): string {
            return 'done';
        }
    }

    it('stores trace metadata for @traced()', async () => {
        const instance = new TraceAsyncService();
        const result = await instance.runAsync('ok');

        expect(result).toBe('ok');
        expect(hasTraced(instance, 'runAsync')).toBe(true);
        expect(getTraced(instance, 'runAsync')).toBe('runAsync');
    });

    it('stores trace metadata for @traced(name)', () => {
        const instance = new TraceSyncService();
        expect(instance.runSync(1)).toBe(2);
        expect(getTraced(instance, 'runSync')).toBe('custom-span');
    });

    it('stores counter metadata for @counted(name)', () => {
        const instance = new CountedService();
        expect(instance.invoke()).toBe('done');
        expect(hasCounted(instance, 'invoke')).toBe(true);
        expect(getCounted(instance, 'invoke')).toEqual({
            name: 'service.invocations',
            attributes: undefined,
        });
    });

    it('aggregates counted metrics per feature when featureAggregator is provided', () => {
        const featureAggregator = new FeatureMetricAggregator();

        class FeatureService {
            @counted({
                attributes: {
                    feature: 'todo',
                },
                featureAggregator,
                name: 'service.invocations',
            })
            invoke(): string {
                return 'done';
            }
        }

        // Manually register the class prototype with the registry
        CountedRegistry.register(FeatureService.prototype);

        // Re-enable instrumentation to pick up the registered class
        instrumentation.enable();

        const instance = new FeatureService();

        // Manually invoke the method twice to trigger the counter
        instance.invoke();
        instance.invoke();

        const metrics = featureAggregator.getFeatureMetrics('todo');

        expect(metrics?.counters.get('service.invocations')).toBe(2);
    });
});
