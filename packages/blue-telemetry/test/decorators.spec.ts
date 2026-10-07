/**
 * @module blue-telemetry
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, expect, it } from 'vitest';
import '@tsmetadata/polyfill';
import { counted, getCounted, hasCounted } from '../src/metrics/decorators';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';
import { getTraced, hasTraced, traced } from '../src/trace/decorators';

describe('telemetry decorators (TC39)', () => {
    class TraceAsyncService {
        @traced()
        async run(value: string): Promise<string> {
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
        const result = await instance.run('ok');

        expect(result).toBe('ok');
        expect(hasTraced(instance, 'run')).toBe(true);
        expect(getTraced(instance, 'run')).toBe('run');
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

    it('wraps the method directly — no instrumentation/registry required', () => {
        // The decorator itself wraps the method, so the counter runs even
        // though no CountedInstrumentation exists (TEL-03: the old
        // registry/enable-scan indirection was dead in production).
        class WrappedService {
            calls = 0;
            @counted()
            invoke(): string {
                this.calls += 1;
                return 'done';
            }
        }

        const instance = new WrappedService();
        expect(instance.invoke()).toBe('done');
        expect(instance.invoke()).toBe('done');
        expect(instance.calls).toBe(2);
        expect(getCounted(instance, 'invoke')?.name).toBe('invoke.count');
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

        const instance = new FeatureService();

        // The decorator wraps the method, so the feature aggregation runs on
        // each call without any instrumentation enable/disable cycle.
        instance.invoke();
        instance.invoke();

        const metrics = featureAggregator.getFeatureMetrics('todo');

        expect(metrics?.counters.get('service.invocations')).toBe(2);
    });
});
