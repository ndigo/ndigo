/**
 * 'none' exporter end-to-end (AD-32 D-2): with no span processors the SDK
 * registers no trace provider, so spans are inert (not recording). Fresh
 * process: one global provider per worker.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { test, expect } from 'vitest';
import { trace } from '@opentelemetry/api';
import { configureTelemetry } from '../src/node-config';

test("traceExporter: 'none' disables the trace export path", () => {
    configureTelemetry({ traceExporter: 'none', sampler: 'always' });

    const span = trace.getTracer('exporter-none-spec').startSpan('probe');
    expect(span.isRecording()).toBe(false);
    span.end();
});
