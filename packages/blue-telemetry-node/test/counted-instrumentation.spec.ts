/**
 * `CountedInstrumentation` spec — a `@counted` counter must bind to the
 * global `MeterProvider` even when the instrumentation is enabled before
 * that provider is registered.
 *
 * `InstrumentationBase` runs `enable()` from its constructor, so the
 * instrumentation below is constructed at module scope — before any
 * `MeterProvider` registration — matching production wiring
 * (`configureTelemetry({ instrumentations: [new CountedInstrumentation()] })`
 * constructs it first). The shimmer wrapper factory runs at that same
 * moment; resolving the counter there captures the NoopMeter and silently
 * drops every datapoint (OP-1). Lazily resolving it on the first patched
 * call binds the real global meter instead.
 *
 * @module blue-telemetry-node
 * @since 1.0.0
 * @author Jeff Rose
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
import { CountedInstrumentation, CountedRegistry, counted } from '@blue/telemetry';

class CountedProbeService {
    @counted('counted.probe.invocations')
    invoke(): string {
        return 'done';
    }
}

// The decorator's `addInitializer` auto-registration runs under the
// TypeScript build but not under vitest's esbuild TC39 transform (the
// initializer is invoked without the class), so register the prototype
// explicitly — the core decorators spec does the same.
CountedRegistry.register(CountedProbeService.prototype);

/**
 * Constructed at module scope — before any MeterProvider registration —
 * matching production wiring; see the module header. The constructor-driven
 * `enable()` wraps `CountedProbeService.invoke` while the global meter is
 * still the NoopMeter.
 */
const instrumentation = new CountedInstrumentation();

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

describe('CountedInstrumentation counter resolution', () => {
    let metricReader: PeriodicExportingMetricReader;

    beforeAll(() => {
        metricReader = new PeriodicExportingMetricReader({
            exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
            exportIntervalMillis: 3_600_000, // never auto-exports; explicit collect() in assertions
        });
        metrics.setGlobalMeterProvider(new MeterProvider({ readers: [metricReader] }));
    });

    afterAll(() => {
        instrumentation.disable();
        CountedRegistry.clear();
    });

    test('exports datapoints when the instrumentation precedes the global meter provider', async () => {
        const service = new CountedProbeService();

        expect(service.invoke()).toBe('done');
        expect(service.invoke()).toBe('done');

        // Control: a counter created after provider registration on the same
        // meter proves the export pipeline works. The instrumented counter
        // would be absent (and this spec red) if it had bound to the
        // NoopMeter during the constructor-time enable().
        metrics.getMeter('@blue/telemetry').createCounter('counted.probe.control').add(1);

        expect(await counterValue(metricReader, 'counted.probe.control')).toBe(1);
        expect(await counterValue(metricReader, 'counted.probe.invocations')).toBe(2);
    });
});
