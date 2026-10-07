/**
 * The scheduled task's telemetry output, asserted deterministically.
 *
 * `LabTicker.tick()` is a plain method — the scheduler's timer calls it, but
 * so can a test. No timers, no sleeping: the lane drives the task directly and
 * checks both metric views plus both spans.
 *
 * Globals are registered once per process (`beforeAll`-style, at module load),
 * so this file is its own Vitest worker: the meter provider collects
 * on demand through `PeriodicExportingMetricReader.collect()` with an export
 * interval that never auto-fires, and the tracer provider hands finished spans
 * to an `InMemorySpanExporter` — the same instruments
 * `packages/blue-telemetry-node/test/counted-decorator.spec.ts` uses.
 *
 * @module blue-telemetry-lab
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterAll, describe, expect, test } from 'vitest';
import { context as otelContext, metrics, trace } from '@opentelemetry/api';
import { AsyncHooksContextManager } from '@opentelemetry/context-async-hooks';
import {
    AggregationTemporality,
    DataPointType,
    InMemoryMetricExporter,
    MeterProvider,
    PeriodicExportingMetricReader,
} from '@opentelemetry/sdk-metrics';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { FeatureMetricAggregator } from '@blue/telemetry';
import { LAB_FEATURE, LabMetrics } from '../src/lab-metrics';
import { LabTicker } from '../src/lab-ticker';
import { WorkService } from '../src/work-service';

const metricReader = new PeriodicExportingMetricReader({
    exporter: new InMemoryMetricExporter(AggregationTemporality.CUMULATIVE),
    exportIntervalMillis: 3_600_000, // never auto-exports; assertions collect()
});
metrics.setGlobalMeterProvider(new MeterProvider({ readers: [metricReader] }));

// Without an async-local context manager the task's span never becomes the
// active context, so the nested `lab.work.compute` span would be a second root
// instead of a child.
const contextManager = new AsyncHooksContextManager();
contextManager.enable();
otelContext.setGlobalContextManager(contextManager);

const spanExporter = new InMemorySpanExporter();
trace.setGlobalTracerProvider(new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(spanExporter)] }));

const aggregator = new FeatureMetricAggregator();
const labMetrics = new LabMetrics(aggregator);
const work = new WorkService(labMetrics);
const ticker = new LabTicker(labMetrics, work);

/**
 * Cumulative value of an OpenTelemetry counter via an explicit collect
 * (counters aggregate as SUM — narrowed through `dataPointType`), `0` when the
 * metric is absent.
 *
 * @param name - The counter name to look up.
 * @returns The cumulative value.
 */
async function counterValue(name: string): Promise<number> {
    const { resourceMetrics } = await metricReader.collect();
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

afterAll(async () => {
    await metricReader.shutdown();
});

describe('blue-telemetry-lab scheduled ticker', () => {
    test('one tick increments the counter in both metric views and emits both spans', async () => {
        const outcome = ticker.tick();

        expect(outcome.units).toBe(1);
        expect(ticker.ticks).toBe(1);

        // Pull view: the feature aggregator `GET /metrics` serializes.
        const feature = aggregator.getFeatureMetrics(LAB_FEATURE);
        expect(feature?.counters.get('scheduled.ticks')).toBe(1);
        expect(feature?.counters.get('work.units')).toBe(1);
        expect(feature?.gauges.get('scheduled.ticks.total')).toBe(1);
        expect(feature?.durations.get('work.durationMs')?.count).toBe(1);

        // Push view: the OpenTelemetry counters `@counted` records.
        expect(await counterValue('telemetry-lab.scheduled.ticks')).toBe(1);
        expect(await counterValue('telemetry-lab.work.requests')).toBe(1);

        // Spans: the task's own root span, and the work span nested under it.
        const names = spanExporter.getFinishedSpans().map((span) => span.name);
        expect(names).toContain('lab.ticker.tick');
        expect(names).toContain('lab.work.compute');

        const tickSpan = spanExporter.getFinishedSpans().find((span) => span.name === 'lab.ticker.tick');
        const workSpan = spanExporter.getFinishedSpans().find((span) => span.name === 'lab.work.compute');
        // The scheduler runs outside any request, so the task's span is a root...
        expect(tickSpan?.parentSpanContext).toBeUndefined();
        // ...and the nested work span hangs off it.
        expect(workSpan?.parentSpanContext?.spanId).toBe(tickSpan?.spanContext().spanId);
        expect(workSpan?.spanContext().traceId).toBe(tickSpan?.spanContext().traceId);
    });

    test('ticks accumulate and stay independent of each other', () => {
        ticker.tick();
        ticker.tick();

        expect(ticker.ticks).toBe(3);
        expect(aggregator.getFeatureMetrics(LAB_FEATURE)?.counters.get('scheduled.ticks')).toBe(3);
        expect(aggregator.getFeatureMetrics(LAB_FEATURE)?.gauges.get('scheduled.ticks.total')).toBe(3);
    });

    test('the work itself is deterministic and clamps its multiplier', () => {
        expect(work.compute('blue', 2).checksum).toBe(work.compute('blue', 2).checksum);
        expect(work.compute('blue', 2).units).toBe(2);
        expect(work.compute('blue', 2).checksum).not.toBe(work.compute('green', 2).checksum);
        // A hostile multiplier is bounded rather than obeyed.
        expect(work.compute('blue', 100_000).units).toBe(1000);
    });
});
