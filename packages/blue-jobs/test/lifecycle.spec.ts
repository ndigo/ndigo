/**
 * @module blue-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { configuration, entry, MetadataConfigApplicationContext } from '@blue/context';
import { delay } from '@blue/util';
import { likeSmartLifecycle } from '@blue/factory';
import { BasicTracerProvider, InMemorySpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { trace } from '@opentelemetry/api';
import { JOB_DRIVER, JOB_HANDLER_REGISTRY, JOB_QUEUE, JOB_RUNNER } from '../src/context-tokens';
import { InProcessJobDriver } from '../src/in-process-job-driver';
import { JobHandlerRegistry } from '../src/job-handler-registry';
import { JobQueue } from '../src/job-queue';
import { JobRunner } from '../src/job-runner';
import { jobHandler } from '../src/job-handler';

class WiredWorker {
    processed: string[] = [];

    @jobHandler('wired.work')
    async work(payload: unknown) {
        this.processed.push(String(payload));
    }
}

/**
 * The NodeAutoConfiguration wiring shape: one `@entry` per jobs bean, all
 * collaborators resolved through the injected context.
 */
@configuration
class JobsConfiguration {
    @entry()
    worker() {
        return new WiredWorker();
    }

    @entry(JOB_DRIVER)
    jobDriver() {
        return new InProcessJobDriver();
    }

    @entry(JOB_HANDLER_REGISTRY)
    jobHandlerRegistry() {
        return new JobHandlerRegistry();
    }

    @entry(JOB_QUEUE)
    jobQueue() {
        return new JobQueue();
    }

    @entry(JOB_RUNNER)
    jobRunner() {
        return new JobRunner({ pollIntervalMs: 5, leaseMs: 10_000 });
    }
}

async function waitFor(predicate: () => boolean | Promise<boolean>): Promise<void> {
    for (let attempt = 0; attempt < 400; attempt += 1) {
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling: each check must observe the previous state
        if (await predicate()) {
            return;
        }
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling interval
        await delay(5);
    }
    throw new Error('waitFor: condition not reached in time');
}

describe('jobs container wiring', () => {
    test('refresh injects the context, scans handlers, and starts the runner; close tears down', async () => {
        const context = new MetadataConfigApplicationContext('jobs');
        context.register(JobsConfiguration);

        context.refresh();

        const worker = context.getValue('worker') as WiredWorker;
        const driver = context.getValue(JOB_DRIVER) as InProcessJobDriver;
        const registry = context.getValue(JOB_HANDLER_REGISTRY) as JobHandlerRegistry;
        const queue = context.getValue(JOB_QUEUE) as JobQueue;
        const runner = context.getValue(JOB_RUNNER) as JobRunner;

        expect(likeSmartLifecycle(registry)).toBe(true);
        expect(likeSmartLifecycle(runner)).toBe(true);
        // The registry scans on refresh; the runner starts explicitly (a
        // pending poll timer keeps the process alive — HTTPServer precedent).
        expect(registry.isRunning).toBe(true);
        expect(runner.isRunning).toBe(false);
        expect(registry.get('wired.work')?.name).toBe('worker.work');

        runner.start();
        expect(runner.isRunning).toBe(true);

        // The queue resolves the jobDriver bean through the injected context.
        await queue.enqueue({ type: 'wired.work', payload: 'one' });
        await waitFor(() => worker.processed.length === 1);
        await waitFor(async () => (await driver.size()) === 0);

        context.close();

        expect(runner.isRunning).toBe(false);
        expect(registry.isRunning).toBe(false);
    });
});

describe('jobs execution telemetry', () => {
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

    test('a successful execution produces a span with id, type, attempt, outcome, duration', async () => {
        const driver = new InProcessJobDriver();
        const registry = new JobHandlerRegistry();
        registry.register('probe.ok', () => Promise.resolve());
        const runner = new JobRunner({ driver, registry, leaseMs: 10_000 });
        await driver.enqueue({ type: 'probe.ok' });

        await runner.tick();
        await runner.drain();

        const spans = exporter.getFinishedSpans();
        expect(spans).toHaveLength(1);
        const span = spans[0];
        expect(span.name).toBe('jobs.job.probe.ok');
        expect(span.attributes?.['job.type']).toBe('probe.ok');
        expect(span.attributes?.['job.attempt']).toBe(1);
        expect(span.attributes?.['job.outcome']).toBe('success');
        expect(typeof span.attributes?.['job.id']).toBe('string');
        expect(typeof span.attributes?.['job.duration_ms']).toBe('number');
    });

    test('a failed attempt records the error outcome', async () => {
        const driver = new InProcessJobDriver();
        const registry = new JobHandlerRegistry();
        registry.register('probe.bad', () => Promise.reject(new Error('boom')));
        const runner = new JobRunner({ driver, registry, leaseMs: 10_000 });
        await driver.enqueue({ type: 'probe.bad', maxAttempts: 1 });

        await runner.tick();
        await runner.drain();

        const spans = exporter.getFinishedSpans();
        expect(spans).toHaveLength(1);
        expect(spans[0]?.attributes?.['job.outcome']).toBe('error');
        expect(spans[0]?.status.code).toBe(2); // SpanStatusCode.ERROR
    });
});
