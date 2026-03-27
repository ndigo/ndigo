import { describe, expect, it } from 'vitest';
import '@tsmetadata/polyfill';
import { counted, getCounted, hasCounted } from '../src/metrics/decorators';
import { FeatureMetricAggregator } from '../src/metrics/feature-metric-aggregator';
import { getTraced, hasTraced, traced } from '../src/trace/decorators';

describe('telemetry decorators (TC39)', () => {
    it('stores trace metadata for @traced()', async () => {
        class ExampleService {
            @traced()
            async runAsync(value: string): Promise<string> {
                return value;
            }
        }

        const instance = new ExampleService();
        const result = await instance.runAsync('ok');

        expect(result).toBe('ok');
        expect(hasTraced(instance, 'runAsync')).toBe(true);
        expect(getTraced(instance, 'runAsync')).toBe('runAsync');
    });

    it('stores trace metadata for @traced(name)', () => {
        class ExampleService {
            @traced('custom-span')
            runSync(value: number): number {
                return value + 1;
            }
        }

        const instance = new ExampleService();
        expect(instance.runSync(1)).toBe(2);
        expect(getTraced(instance, 'runSync')).toBe('custom-span');
    });

    it('stores counter metadata for @counted(name)', () => {
        class ExampleService {
            @counted('service.invocations')
            invoke(): string {
                return 'done';
            }
        }

        const instance = new ExampleService();
        expect(instance.invoke()).toBe('done');
        expect(hasCounted(instance, 'invoke')).toBe(true);
        expect(getCounted(instance, 'invoke')).toEqual({
            name: 'service.invocations',
            attributes: undefined,
        });
    });

    it('aggregates counted metrics per feature when featureAggregator is provided', () => {
        const featureAggregator = new FeatureMetricAggregator();

        class ExampleService {
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

        const instance = new ExampleService();

        expect(instance.invoke()).toBe('done');
        expect(instance.invoke()).toBe('done');

        const metrics = featureAggregator.getFeatureMetrics('todo');

        expect(metrics?.counters.get('service.invocations')).toBe(2);
    });
});
