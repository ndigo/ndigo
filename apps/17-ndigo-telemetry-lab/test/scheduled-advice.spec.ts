/**
 * Where the two container mechanisms meet.
 *
 * Advice weaves at entry creation (`InitializationAwareProcessor`); the
 * schedule registry scans later and captures `owner[methodName]` into a
 * closure (`ManagedLifecycle`, phase 0). If that capture happened before weaving,
 * or took the prototype method, a `@scheduled` + `@traced` method would run
 * unadvised — and no lane asserted this on the container path, only on the
 * directly-advised path (`scheduled-task.spec.ts`).
 */
// @vitest-environment node
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { context as otelContext, trace } from '@opentelemetry/api';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { ApplicationBuilder } from '@ndigo/boot';
import { configuration, entry, type ConfigurableApplicationContext } from '@ndigo/context';
import { NodeAutoConfiguration } from '@ndigo/platform-node';
import { scheduled, TASK_SCHEDULER, TaskScheduler } from '@ndigo/scheduler';
import { hasAnnotation, interception, MethodInterceptorRegistry } from '@ndigo/advice';
import { CountedInterceptor, countedCounter, traced, TracedInterceptor, tracedSpan } from '@ndigo/telemetry';

const spanExporter = new InMemorySpanExporter();

class ProbeTicker {
    ticks = 0;

    @scheduled('* * * * *') // every minute; the spec drives a tick deterministically
    @traced('probe.tick')
    tick(): void {
        this.ticks += 1;
    }
}

@configuration
class ProbeConfiguration {
    readonly #ticker = new ProbeTicker();

    @entry()
    probeTicker(): ProbeTicker {
        return this.#ticker;
    }
}

describe('@scheduled over the container path', () => {
    let context: ConfigurableApplicationContext;

    beforeAll(async () => {
        const contextManager = new AsyncLocalStorageContextManager();
        contextManager.enable();
        otelContext.setGlobalContextManager(contextManager);
        trace.setGlobalTracerProvider(
            new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(spanExporter)] })
        );

        const advice = new MethodInterceptorRegistry()
            .add({ when: hasAnnotation(tracedSpan), use: new TracedInterceptor() })
            .add({ when: hasAnnotation(countedCounter), use: new CountedInterceptor() });

        context = await new ApplicationBuilder([NodeAutoConfiguration, ProbeConfiguration])
            .processors(interception(advice))
            .run();
    });

    afterAll(() => {
        context?.getValue<TaskScheduler>(TASK_SCHEDULER).stop();
        context?.close();
    });

    test('the scheduler runs the woven method, not the prototype method', async () => {
        const ticker = context.getValue<ProbeTicker>('probeTicker');
        const scheduler = context.getValue<TaskScheduler>(TASK_SCHEDULER);

        // The registry captured `owner[methodName]` at scan time. Driving the
        // scheduler is the only way to exercise that capture: if it had taken
        // the prototype method, or run before weaving, no span would appear.
        expect(scheduler.taskNames()).toContain('probeTicker.tick');
        // The cron's first fire is the next minute boundary; tick past it.
        expect(await scheduler.tick(new Date(Date.now() + 120_000))).toBe(1);

        expect(ticker.ticks).toBe(1);
        expect(spanExporter.getFinishedSpans().map((span) => span.name)).toContain('probe.tick');
    });
});
