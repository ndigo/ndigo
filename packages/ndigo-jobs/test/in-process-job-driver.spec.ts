/**
 */
import { describe, test, expect, beforeEach } from 'vitest';
import { InProcessJobDriver } from '../src/in-process-job-driver';

const T0 = 1_000_000;

/**
 * Deterministic driver: a controllable clock and sequential ids.
 */
function makeDriver(): { driver: InProcessJobDriver; advance: (ms: number) => void } {
    let now = T0;
    let sequence = 0;
    const driver = new InProcessJobDriver({
        clock: () => now,
        idFactory: () => `job-${++sequence}`,
    });
    return {
        driver,
        advance: (ms: number) => {
            now += ms;
        },
    };
}

describe('InProcessJobDriver', () => {
    let driver: InProcessJobDriver;
    let advance: (ms: number) => void;

    beforeEach(() => {
        ({ driver, advance } = makeDriver());
    });

    test('enqueue stores a queued record; size counts it', async () => {
        const record = await driver.enqueue({ type: 'email.send', payload: { to: 'a@b.c' } });

        expect(record.id).toBe('job-1');
        expect(record.type).toBe('email.send');
        expect(record.attempts).toBe(0);
        expect(record.maxAttempts).toBe(3);
        expect(record.runAt).toBe(T0);
        expect(record.createdAt).toBe(T0);
        expect(await driver.size()).toBe(1);
    });

    test('claim takes ready jobs in runAt then createdAt order and leases them', async () => {
        await driver.enqueue({ type: 'later', runAt: T0 + 100 });
        await driver.enqueue({ type: 'now' });
        await driver.enqueue({ type: 'earlier', runAt: T0 - 500 });

        const first = await driver.claim({ limit: 2, leaseMs: 1000 });

        expect(first.map((job) => job.type)).toEqual(['earlier', 'now']);
        expect(first.every((job) => job.attempts === 1)).toBe(true);
        expect(await driver.size()).toBe(3); // running counts as pending
        expect(await driver.claim({ limit: 2, leaseMs: 1000 })).toHaveLength(0); // leased
    });

    test('a delayed job is not claimed before its runAt', async () => {
        await driver.enqueue({ type: 'delayed', delayMs: 1000 });

        expect(await driver.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
        advance(1000);
        expect(await driver.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(1);
    });

    test('an expired lease is reclaimed by the next claim, attempts preserved', async () => {
        await driver.enqueue({ type: 'crashy' });
        const [first] = await driver.claim({ limit: 1, leaseMs: 100 });

        expect(first?.attempts).toBe(1);
        advance(100);
        const [reclaimed] = await driver.claim({ limit: 1, leaseMs: 100 });

        expect(reclaimed?.id).toBe(first?.id);
        expect(reclaimed?.attempts).toBe(2);
    });

    test('heartbeat extends the lease', async () => {
        await driver.enqueue({ type: 'slow' });
        const [job] = await driver.claim({ limit: 1, leaseMs: 100 });
        if (job === undefined) {
            throw new Error('expected the enqueued job to be claimed');
        }
        advance(60);
        await driver.heartbeat(job.id, 1000);

        advance(60); // past the original lease, inside the extension
        expect(await driver.claim({ limit: 1, leaseMs: 100 })).toHaveLength(0);
    });

    test('complete removes the job; fail removes it terminally', async () => {
        const done = await driver.enqueue({ type: 'done' });
        const failed = await driver.enqueue({ type: 'failed' });
        await driver.complete(done.id);
        await driver.fail(failed.id, 'boom');

        expect(await driver.size()).toBe(0);
    });

    test('retry reschedules the job with the recorded error', async () => {
        await driver.enqueue({ type: 'flaky' });
        const [job] = await driver.claim({ limit: 1, leaseMs: 100 });
        if (job === undefined) {
            throw new Error('expected the enqueued job to be claimed');
        }
        await driver.retry(job.id, T0 + 5000, 'boom');

        expect(await driver.claim({ limit: 1, leaseMs: 100 })).toHaveLength(0);
        advance(5000);
        const [retried] = await driver.claim({ limit: 1, leaseMs: 100 });

        expect(retried?.attempts).toBe(2);
        expect(retried?.lastError).toBe('boom');
    });

    test('claimed payloads are copies, not aliases of the enqueued value', async () => {
        const payload = { items: [1] };
        await driver.enqueue({ type: 'copy', payload });
        payload.items.push(2);

        const [job] = await driver.claim({ limit: 1, leaseMs: 100 });
        expect(job?.payload).toEqual({ items: [1] });
    });

    test('a closed driver rejects every operation', async () => {
        await driver.close();

        await expect(driver.enqueue({ type: 'x' })).rejects.toThrow(/closed/);
        await expect(driver.claim({ limit: 1, leaseMs: 1 })).rejects.toThrow(/closed/);
        await expect(driver.size()).rejects.toThrow(/closed/);
    });

    test('claim validates its window', async () => {
        await expect(driver.claim({ limit: 0, leaseMs: 1 })).rejects.toThrow(/limit/);
        await expect(driver.claim({ limit: 1, leaseMs: 0 })).rejects.toThrow(/leaseMs/);
    });
});
