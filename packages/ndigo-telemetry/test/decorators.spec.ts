/**
 */
import { describe, expect, it } from 'vitest';
import '@tsmetadata/polyfill';
import { counted, CountedInterceptor, countedCounter, getCounted, hasCounted } from '../src/metrics/decorators';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';
import { TracedInterceptor, tracedSpan } from '../src/trace/interceptor';
import { getTraced, hasTraced, traced } from '../src/trace/decorators';
import { hasAnnotation, interceptMethods } from '@ndigo/advice';

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

    it('is inert until advised', async () => {
        const tracedRules = [{ when: hasAnnotation(tracedSpan), use: new TracedInterceptor() }];
        const instance = interceptMethods(new TraceAsyncService(), tracedRules);

        // Still returns the method's own value, and the interceptor does not
        // make a sync method return a promise.
        expect(await instance.run('ok')).toBe('ok');
        expect(interceptMethods(new TraceSyncService(), tracedRules).runSync(1)).toBe(2);
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

    it('declares the counter without running anything, and records once advised', () => {
        class WrappedService {
            calls = 0;
            @counted()
            invoke(): string {
                this.calls += 1;
                return 'done';
            }
        }

        const bare = new WrappedService();
        expect(bare.invoke()).toBe('done');
        expect(bare.calls).toBe(1);
        expect(getCounted(bare, 'invoke')?.name).toBe('invoke.count');

        const instance = interceptMethods(new WrappedService(), [
            { when: hasAnnotation(countedCounter), use: new CountedInterceptor() },
        ]);
        expect(instance.invoke()).toBe('done');
        expect(instance.invoke()).toBe('done');
        expect(instance.calls).toBe(2);
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

        const instance = interceptMethods(new FeatureService(), [
            { when: hasAnnotation(countedCounter), use: new CountedInterceptor() },
        ]);

        instance.invoke();
        instance.invoke();

        const metrics = featureAggregator.getFeatureMetrics('todo');

        expect(metrics?.counters.get('service.invocations')).toBe(2);
    });
});
