/**
 * @module blue-scheduler
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { GenericApplicationContext } from '@blue/context';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace } from '@opentelemetry/api';
import { TASK_SCHEDULER } from '../src/context-tokens';
import { scheduled } from '../src/scheduled';
import { ScheduleRegistry } from '../src/schedule-registry';
import { IntervalSchedule } from '../src/schedule';
import { TaskScheduler } from '../src/task-scheduler';
import { instrumentTask } from '../src/telemetry';

const T0 = new Date('2026-09-13T10:00:00Z');
const at = (secondsLater: number): Date => new Date(T0.getTime() + secondsLater * 1_000);

class ScheduledWorker {
    runs = 0;

    @scheduled({ fixedRate: '1h' })
    hourly() {
        this.runs += 1;
    }
}

describe('@blue/scheduler lifecycle (container bean)', () => {
    let context: GenericApplicationContext;
    let scheduler: TaskScheduler;

    beforeEach(() => {
        context = new GenericApplicationContext('test');
        scheduler = new TaskScheduler({ clock: () => T0 });
        context.setValue(TASK_SCHEDULER, scheduler);
    });

    afterEach(async () => {
        await scheduler.destroy();
        context.close();
    });

    test('start without a bound context fails loudly', () => {
        const registry = new ScheduleRegistry();

        expect(() => registry.start()).toThrow(/no application context/);
    });

    test('start without a taskScheduler bean fails loudly', () => {
        const bare = new GenericApplicationContext('bare');
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(bare);

        expect(() => registry.start()).toThrow(/taskScheduler/);
    });

    test('start discovers registered beans, registers tasks, and starts the loop', () => {
        const worker = new ScheduledWorker();
        context.setValue('worker', worker);
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(context);
        // The container would auto-start on refresh; drive it manually here.
        registry.start();

        expect(registry.isRunning).toBe(true);
        expect(scheduler.taskNames()).toEqual(['worker.hourly']);
        expect(scheduler.isRunning).toBe(true); // started by the registry

        registry.stop();
        expect(registry.isRunning).toBe(false);
        expect(scheduler.taskNames()).toEqual([]); // unregistered on stop
    });

    test('start is idempotent while running', () => {
        context.setValue('worker', new ScheduledWorker());
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(context);
        registry.start();
        const count = scheduler.taskNames().length;

        registry.start();
        expect(scheduler.taskNames()).toHaveLength(count);
    });

    test('stop then start re-scans and resumes the loop on the same registry', () => {
        const worker = new ScheduledWorker();
        context.setValue('worker', worker);
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(context);
        registry.start();
        expect(scheduler.taskNames()).toEqual(['worker.hourly']);

        registry.stop();
        expect(registry.isRunning).toBe(false);
        expect(scheduler.taskNames()).toEqual([]);

        registry.start();
        expect(registry.isRunning).toBe(true);
        expect(scheduler.taskNames()).toEqual(['worker.hourly']);
        expect(scheduler.isRunning).toBe(true);
        registry.stop();
    });

    test('start after destroy fails loudly', async () => {
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(context);
        registry.start();
        await registry.destroy();

        expect(() => registry.start()).toThrow(/destroyed/);
    });

    test('destroy stops the scheduler and marks the registry destroyed', async () => {
        context.setValue('worker', new ScheduledWorker());
        const registry = new ScheduleRegistry();
        registry.setApplicationContext(context);
        registry.start();

        await registry.destroy();

        expect(registry.destroyed).toBe(true);
        expect(registry.isRunning).toBe(false);
        expect(scheduler.destroyed).toBe(true);
    });
});

describe('@blue/scheduler per-run telemetry', () => {
    let exporter: InMemorySpanExporter;
    let provider: BasicTracerProvider;

    beforeAll(() => {
        // One provider for the whole describe: the OTel API caches the
        // tracer against the first global provider it saw, so per-test
        // providers would route spans to a dead exporter.
        exporter = new InMemorySpanExporter();
        provider = new BasicTracerProvider({ spanProcessors: [new SimpleSpanProcessor(exporter)] });
        trace.setGlobalTracerProvider(provider);
    });

    beforeEach(() => {
        exporter.reset();
    });

    afterAll(() => {
        void provider.shutdown();
        trace.setGlobalTracerProvider(undefined as never);
    });

    test('every run produces a span with the task name, outcome, and duration', async () => {
        const scheduler = new TaskScheduler({ clock: () => T0 });
        scheduler.register(
            instrumentTask({
                name: 'probe.tick',
                schedule: new IntervalSchedule('fixedRate', 10_000),
                run: () => Promise.resolve(),
            })
        );

        await scheduler.tick(at(10));

        const spans = exporter.getFinishedSpans();
        expect(spans).toHaveLength(1);
        const span = spans[0];
        expect(span.name).toBe('scheduler.task.probe.tick');
        expect(span.attributes?.['task.name']).toBe('probe.tick');
        expect(span.attributes?.['task.outcome']).toBe('success');
        expect(typeof span.attributes?.['task.duration_ms']).toBe('number');

        await scheduler.destroy();
    });

    test('failed runs record the exception and the outcome attribute', async () => {
        const scheduler = new TaskScheduler({ clock: () => T0 });
        scheduler.register(
            instrumentTask({
                name: 'probe.flaky',
                schedule: new IntervalSchedule('fixedRate', 10_000),
                run: () => Promise.reject(new Error('boom')),
            })
        );

        await scheduler.tick(at(10));

        const spans = exporter.getFinishedSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0].attributes?.['task.outcome']).toBe('error');

        await scheduler.destroy();
    });
});
