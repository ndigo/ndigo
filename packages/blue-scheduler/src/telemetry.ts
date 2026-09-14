/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { SpanKind, SpanStatusCode, trace } from '@opentelemetry/api';
import { ScheduledTaskDefinition } from './task-scheduler';

const TRACER_NAME = '@blue/scheduler';

/**
 * Wraps a task's run with an OpenTelemetry span.
 *
 * One INTERNAL span per run (`scheduler.task.<name>`) carrying the task
 * name, outcome, and duration — the dispatcher/SSE instrumentation pattern
 * (`startSpan` + explicit end, so async rejection is handled deterministically).
 * The error is rethrown so the engine still records `failures`.
 *
 * @param task - The task to instrument.
 * @returns A task whose `run` opens and closes the span.
 */
export function instrumentTask(task: ScheduledTaskDefinition): ScheduledTaskDefinition {
    return {
        ...task,
        run: () => withTaskSpan(task),
    };
}

async function withTaskSpan(task: ScheduledTaskDefinition): Promise<void> {
    const tracer = trace.getTracer(TRACER_NAME);
    const span = tracer.startSpan(`scheduler.task.${task.name}`, { kind: SpanKind.INTERNAL });
    const began = Date.now();

    try {
        span.setAttribute('task.name', task.name);
        await task.run();
        span.setAttribute('task.outcome', 'success');
    } catch (error) {
        span.setAttribute('task.outcome', 'error');
        span.setStatus({ code: SpanStatusCode.ERROR });
        span.recordException(error instanceof Error ? error : new Error(String(error)));
        throw error;
    } finally {
        span.setAttribute('task.duration_ms', Date.now() - began);
        span.end();
    }
}
