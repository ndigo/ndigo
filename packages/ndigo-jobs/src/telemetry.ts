/**
 * OpenTelemetry instrumentation for job execution.
 */
import { SpanKind, SpanStatusCode, trace, type Span } from '@opentelemetry/api';
import type { JobRecord } from './job';

const TRACER_NAME = '@ndigo/jobs';

/**
 * One in-flight job-execution span, ended exactly once by the runner.
 */
export interface JobSpan {
    /**
     * Records the outcome and ends the span.
     *
     * @param outcome - `'success'` or `'error'`.
     * @param error - The failure, when `outcome` is `'error'`.
     */
    end(outcome: 'success' | 'error', error?: unknown): void;
}

/**
 * Opens an INTERNAL span for one job execution
 * (`jobs.job.<type>`, attributes `job.id`, `job.type`, `job.attempt`).
 *
 * The dispatcher/scheduler pattern: explicit `end()` so the runner controls
 * when the outcome is known, and `job.duration_ms` for the recorded attempt.
 *
 * @param job - The claimed job this execution belongs to.
 * @returns The span handle the runner ends.
 */
export function startJobSpan(job: Pick<JobRecord, 'id' | 'type' | 'attempts'>): JobSpan {
    const tracer = trace.getTracer(TRACER_NAME);
    const span: Span = tracer.startSpan(`jobs.job.${job.type}`, { kind: SpanKind.INTERNAL });
    const began = Date.now();
    span.setAttribute('job.id', job.id);
    span.setAttribute('job.type', job.type);
    span.setAttribute('job.attempt', job.attempts);

    let ended = false;
    return {
        end(outcome: 'success' | 'error', error?: unknown): void {
            if (ended) {
                return;
            }
            ended = true;
            span.setAttribute('job.outcome', outcome);
            span.setAttribute('job.duration_ms', Date.now() - began);
            if (outcome === 'error') {
                span.setStatus({ code: SpanStatusCode.ERROR });
                if (error !== undefined) {
                    span.recordException(error instanceof Error ? error : new Error(String(error)));
                }
            }
            span.end();
        },
    };
}
