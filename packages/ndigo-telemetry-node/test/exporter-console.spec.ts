/**
 * Console exporter end-to-end (AD-32 D-2): the dev default selects the
 * console exporter, which means the trace provider IS registered (spans
 * record) and finishing a span hands it to the simple processor without
 * throwing. Fresh process: one global provider per worker.
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { trace } from '@opentelemetry/api';
import { configureTelemetry } from '../src/node-config';

test("traceExporter: 'console' registers a recording provider", () => {
    configureTelemetry({ traceExporter: 'console' });

    const span = trace.getTracer('exporter-console-spec').startSpan('probe');
    expect(span.isRecording()).toBe(true);

    // SimpleSpanProcessor hands the span to the console exporter on end.
    span.end();
});
