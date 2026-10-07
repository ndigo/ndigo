/**
 * @module blue-jobs
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { delay } from '@blue/util';
import { GenericApplicationContext } from '@blue/context';
import { JOB_DRIVER, JOB_HANDLER_REGISTRY } from '../src/context-tokens';
import { InProcessJobDriver } from '../src/in-process-job-driver';
import { JobHandlerRegistry } from '../src/job-handler-registry';
import { JobRunner } from '../src/job-runner';

const T0 = 1_000_000;

/** Deterministic runner harness: controllable clock + in-process registry. */
function makeRunner(options: { concurrency?: number; maxAttempts?: number } = {}): {
    runner: JobRunner;
    driver: InProcessJobDriver;
    registry: JobHandlerRegistry;
    advance: (ms: number) => void;
} {
    let now = T0;
    const driver = new InProcessJobDriver({ clock: () => now });
    const registry = new JobHandlerRegistry();
    const runner = new JobRunner({
        driver,
        registry,
        clock: () => now,
        leaseMs: 10_000,
        pollIntervalMs: 5,
        concurrency: options.concurrency,
    });
    return {
        runner,
        driver,
        registry,
        advance: (ms: number) => {
            now += ms;
        },
    };
}

describe('JobRunner', () => {
    test('executes a registered handler and completes the job', async () => {
        const { runner, driver, registry } = makeRunner();
        const seen: unknown[] = [];
        registry.register('echo', (payload) => {
            seen.push(payload);
        });
        await driver.enqueue({ type: 'echo', payload: { n: 1 } });

        expect(await runner.tick()).toBe(1);
        await runner.drain();

        expect(seen).toEqual([{ n: 1 }]);
        expect(await driver.size()).toBe(0);
    });

    test('a failing handler retries with backoff until maxAttempts, then fails terminally', async () => {
        const { runner, driver, registry, advance } = makeRunner();
        const attempts: number[] = [];
        registry.register('flaky', (_payload, context) => {
            attempts.push(context.attempt);
            throw new Error('boom');
        });
        await driver.enqueue({ type: 'flaky', maxAttempts: 3 });

        // attempt 1 — retry scheduled (1s backoff)
        expect(await runner.tick()).toBe(1);
        await runner.drain();
        expect(await driver.size()).toBe(1);

        advance(1000);
        expect(await runner.tick()).toBe(1);
        await runner.drain();

        advance(2000);
        expect(await runner.tick()).toBe(1);
        await runner.drain();

        expect(attempts).toEqual([1, 2, 3]);
        expect(await driver.size()).toBe(0); // terminally failed and removed
        expect(await runner.tick()).toBe(0); // nothing left
    });

    test('registry handler options override record values', async () => {
        const { runner, driver, registry } = makeRunner();
        const attempts: number[] = [];
        registry.register(
            'override',
            (_payload, context) => {
                attempts.push(context.attempt);
                throw new Error('boom');
            },
            { type: 'override', maxAttempts: 1 }
        );
        await driver.enqueue({ type: 'override', maxAttempts: 9 });

        await runner.tick();
        await runner.drain();

        expect(attempts).toEqual([1]);
        expect(await driver.size()).toBe(0);
    });

    test('a job without a handler fails terminally', async () => {
        const { runner, driver } = makeRunner();
        await driver.enqueue({ type: 'unhandled' });

        expect(await runner.tick()).toBe(1);
        await runner.drain();

        expect(await driver.size()).toBe(0);
    });

    test('a timeout aborts the signal and settles the attempt as failed', async () => {
        const { runner, driver, registry } = makeRunner();
        const aborted: boolean[] = [];
        registry.register('hangs', (_payload, context) => {
            const { promise, resolve } = Promise.withResolvers<void>();
            context.signal.addEventListener('abort', () => {
                aborted.push(true);
                resolve();
            });
            return promise;
        });
        await driver.enqueue({ type: 'hangs', timeoutMs: 20, maxAttempts: 1 });

        await runner.tick();
        await runner.drain();

        expect(aborted).toEqual([true]);
        expect(await driver.size()).toBe(0); // failed terminally after the timeout
    });

    test('a handler that ignores the signal is still settled by the timeout', async () => {
        const { runner, driver, registry } = makeRunner();
        registry.register('ignores', () => new Promise<void>(() => undefined));
        await driver.enqueue({ type: 'ignores', timeoutMs: 20, maxAttempts: 1 });

        await runner.tick();
        await runner.drain();

        expect(await driver.size()).toBe(0);
    });

    test('concurrency bounds how many jobs one pass claims', async () => {
        const { runner, driver, registry } = makeRunner({ concurrency: 2 });
        const releases: Array<() => void> = [];
        registry.register('hold', () => {
            const { promise, resolve } = Promise.withResolvers<void>();
            releases.push(resolve);
            return promise;
        });
        await driver.enqueue({ type: 'hold' });
        await driver.enqueue({ type: 'hold' });
        await driver.enqueue({ type: 'hold' });

        expect(await runner.tick()).toBe(2);
        expect(runner.inFlight).toBe(2);

        releases.forEach((release) => release());
        await runner.drain();
        expect(await runner.tick()).toBe(1); // the third job runs in the next pass
        releases.forEach((release) => release());
        await runner.drain();
        expect(await driver.size()).toBe(0);
    });

    test('concurrent tick calls share one pass', async () => {
        const { runner, driver, registry } = makeRunner();
        let runs = 0;
        registry.register('once', () => {
            runs += 1;
        });
        await driver.enqueue({ type: 'once' });

        const [first, second] = await Promise.all([runner.tick(), runner.tick()]);
        await runner.drain();

        expect(first).toBe(1);
        expect(second).toBe(1);
        expect(runs).toBe(1);
    });

    test('close drains in-flight executions', async () => {
        const { runner, driver, registry } = makeRunner();
        let finished = false;
        registry.register('slow', async () => {
            await delay(10);
            finished = true;
        });
        await driver.enqueue({ type: 'slow' });
        await runner.tick();

        await runner.close();

        expect(finished).toBe(true);
        await expect(runner.tick()).rejects.toThrow(/closed/);
    });

    test('start resolves the container beans and polls; stop halts claiming', async () => {
        const context = new GenericApplicationContext('jobs');
        const now = T0;
        const driver = new InProcessJobDriver({ clock: () => now });
        const registry = new JobHandlerRegistry();
        const runs: string[] = [];
        registry.register('wired', (payload) => {
            runs.push(String(payload));
        });
        const runner = new JobRunner({ clock: () => now, pollIntervalMs: 5, leaseMs: 10_000 });
        context.setValue(JOB_DRIVER, driver);
        context.setValue(JOB_HANDLER_REGISTRY, registry);
        runner.setApplicationContext(context);

        runner.start();
        expect(runner.isRunning).toBe(true);
        await driver.enqueue({ type: 'wired', payload: 'hello' });
        await waitFor(() => runs.length === 1);
        runner.stop();
        expect(runner.isRunning).toBe(false);
        await runner.close();
        context.close();
    });

    test('start without container beans fails loud', () => {
        const runner = new JobRunner();

        expect(() => runner.start()).toThrow(/no job driver/);
    });

    test('lifecycle shape: phase 10, explicit start by default, closeable', async () => {
        const { runner } = makeRunner();

        expect(runner.phase).toBe(10);
        expect(runner.isAutoStartup).toBe(false); // explicit start keeps no timer pending
        expect(new JobRunner({ autoStart: true }).isAutoStartup).toBe(true);
        await runner.close();
        await runner.close(); // idempotent
    });
});

/**
 * Polls `predicate` until it is true (bounded, real-timer loop for the
 * started-runner test).
 *
 * @param predicate - Condition to await.
 */
async function waitFor(predicate: () => boolean): Promise<void> {
    for (let attempt = 0; attempt < 200; attempt += 1) {
        if (predicate()) {
            return;
        }
        // oxlint-disable-next-line no-await-in-loop -- deterministic polling interval
        await delay(5);
    }
    throw new Error('waitFor: condition not reached in time');
}
