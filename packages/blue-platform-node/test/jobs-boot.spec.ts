/**
 * Jobs stack through the real `NodeAutoConfiguration` (AD-72): the four
 * beans exist, the registry scans `@jobHandler` beans on refresh, and an
 * explicitly started runner executes an enqueued job end to end.
 *
 * @module blue-platform-node
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { describe, test, expect } from 'vitest';
import { configuration, entry, MetadataConfigApplicationContext } from '@blue/context';
import { delay } from '@blue/util';
import {
    JOB_DRIVER,
    JOB_HANDLER_REGISTRY,
    JOB_QUEUE,
    JOB_RUNNER,
    jobHandler,
    type InProcessJobDriver,
    type JobHandlerRegistry,
    type JobQueue,
    type JobRunner,
} from '@blue/jobs';
import { NodeAutoConfiguration } from '../src/node-auto-configuration';

class ProbeWorker {
    processed: string[] = [];

    @jobHandler('probe.work')
    async work(payload: unknown) {
        this.processed.push(String(payload));
    }
}

@configuration
class WorkerConfiguration {
    @entry()
    worker() {
        return new ProbeWorker();
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

describe('jobs stack through NodeAutoConfiguration', () => {
    test('boots, scans handlers, and executes an enqueued job', async () => {
        const context = new MetadataConfigApplicationContext('jobs-app');
        context.register(NodeAutoConfiguration);
        context.register(WorkerConfiguration);

        context.refresh();

        const worker = context.getValue('worker') as ProbeWorker;
        const driver = context.getValue(JOB_DRIVER) as InProcessJobDriver;
        const registry = context.getValue(JOB_HANDLER_REGISTRY) as JobHandlerRegistry;
        const queue = context.getValue(JOB_QUEUE) as JobQueue;
        const runner = context.getValue(JOB_RUNNER) as JobRunner;

        expect(driver.kind).toBe('in-process');
        expect(registry.get('probe.work')?.name).toBe('worker.work');
        expect(runner.isRunning).toBe(false); // explicit start — no pending poll timer

        runner.start();
        await queue.enqueue({ type: 'probe.work', payload: 'one' });
        await waitFor(() => worker.processed.length === 1);
        await waitFor(async () => (await driver.size()) === 0);

        context.close();
        expect(runner.isRunning).toBe(false);
    });
});
