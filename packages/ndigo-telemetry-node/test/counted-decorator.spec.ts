/**
 * `@counted` decorator spec — the counter must bind to the global
 * `MeterProvider` even though the decorator wraps the method at
 * class-definition time, before any SDK provider is registered.
 *
 * The decorator resolves the counter lazily on the first recorded call
 * (post-SDK-init), mirroring `@traced`; an eager `createCounter` at
 * decoration time would capture the NoopMeter and silently drop every
 * datapoint. There is no instrumentation/registry indirection to enable
 * (TEL-03).
 */
// @vitest-environment node
import { describe, test, expect, beforeAll, afterAll } from 'vitest';
import {
    AggregationTemporality,
    DataPointType,
    InMemoryMetricExporter,
    MeterProvider,
    PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { metrics } from '@opentelemetry/api';
import { counted } from '@ndigo/telemetry';

class CountedProbeService {
    @counted('counted.probe.invocations')
    invoke(): string {
        return 'done';
    }
}

/**
 * Cumulative value of the counter via an explicit collect (counters
 * aggregate as SUM — narrowed through `dataPointType`), `0` when the metric
 * is absent.
 *
 * @param reader - The metric reader to collect from.
 * @param name - The counter name (e.g. `counted.probe.invocations`).
 * @returns The cumulative counter value.
 */
async function counterValue(reader: PeriodicExportingMetricReader, name: string): Promise<number> {
    const { resourceMetrics } = await reader.collect();
    for (const scope of resourceMetrics.scopeMetrics) {
        for (const metric of scope.metrics) {
            if (metric.descriptor?.name === name && metric.dataPointType === DataPointType.SUM) {
                let total = 0;
                for (const point of metric.dataPoints) {
                    total += point.value;
                }
                return total;
            }
        }
    }
    return 0;
}

describe('@counted counter resolution', () => {
    let metricReader: PeriodicExportingMetricReader;

    beforeAll(() => {
        metricReader = new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
            exportIntervalMillis: 3_600_000, // never auto-exports; explicit collect() in assertions
        });
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [metricReader] }));
    });

    afterAll(async () => {
        await metricReader.shutdown();
    });

    test('exports datapoints even though the decorated class precedes the global meter provider', async () => {
        const service = new CountedProbeService();

        expect(service.invoke()).toBe('done');
        expect(service.invoke()).toBe('done');

        // Control: a counter created after provider registration on the same
        // meter proves the export pipeline works. The decorated counter
        // would be absent (and this spec red) if it had bound to the
        // NoopMeter when the decorator ran.
        metrics.getMeter('@ndigo/telemetry').createCounter('counted.probe.control').add(1);

        expect(await counterValue(metricReader, 'counted.probe.control')).toBe(1);
        expect(await counterValue(metricReader, 'counted.probe.invocations')).toBe(2);
    });
});
