/**
 * Shared helpers for the sampler scenario specs.
 *
 * OpenTelemetry's API registers a global trace provider ONCE per process
 * (later registrations are silently ignored — see AD-32), so every sampler
 * scenario runs in its own spec file: one `configureTelemetry` call per
 * worker process, asserting recording decisions at span start.
 */
import { context as otelContext, trace } from '@opentelemetry/api';
import type { Span, Tracer } from '@opentelemetry/api';
import { configureTelemetry } from '../../src/node-config';
import type { SamplerSpec } from '../../src/node-config';

let configured = false;

/** Configures the global trace provider for the process and returns a tracer. */
export function tracerWithSampler(spec: SamplerSpec | undefined): Tracer {
    if (!configured) {
        configureTelemetry({ sampler: spec });
        configured = true;
    }
    return trace.getTracer('sampler-config-spec');
}

/** Starts `count` root spans and returns how many are recording. */
export function countRecording(tracer: Tracer, count: number): number {
    let recording = 0;
    for (let index = 0; index < count; index += 1) {
        if (tracer.startSpan('probe').isRecording()) {
            recording += 1;
        }
    }
    return recording;
}

/** Starts a child of `parent` by making it the active context. */
export function childOf(tracer: Tracer, parent: Span): Span {
    let child: Span | undefined;
    const parentContext = trace.setSpan(otelContext.active(), parent);
    otelContext.with(parentContext, () => {
        child = tracer.startSpan('child');
    });
    return child as Span;
}

/** Finds one recording and one dropped root span (deterministic ratio sampler). */
export function sampleBothDecisions(tracer: Tracer): { recordingRoot: Span; droppedRoot: Span } {
    let recordingRoot: Span | undefined;
    let droppedRoot: Span | undefined;
    for (let index = 0; index < 200 && (!recordingRoot || !droppedRoot); index += 1) {
        const span = tracer.startSpan('root');
        if (span.isRecording()) {
            recordingRoot ??= span;
        } else {
            droppedRoot ??= span;
        }
    }
    return { recordingRoot: recordingRoot as Span, droppedRoot: droppedRoot as Span };
}
