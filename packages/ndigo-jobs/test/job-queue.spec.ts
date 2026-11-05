/**
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { GenericApplicationContext } from '@ndigo/context';
import { JOB_DRIVER } from '../src/context-tokens';
import { InProcessJobDriver } from '../src/in-process-job-driver';
import { JobQueue } from '../src/job-queue';

describe('JobQueue', () => {
    test('forwards requests with the configured default maxAttempts', async () => {
        const driver = new InProcessJobDriver();
        const queue = new JobQueue({ driver, maxAttempts: 5 });

        const record = await queue.enqueue({ type: 'email.send' });

        expect(record.maxAttempts).toBe(5);
    });

    test('a request-level maxAttempts wins over the default', async () => {
        const driver = new InProcessJobDriver();
        const queue = new JobQueue({ driver });

        const record = await queue.enqueue({ type: 'email.send', maxAttempts: 1 });

        expect(record.maxAttempts).toBe(1);
    });

    test('resolves the jobDriver bean from its application context', async () => {
        const context = new GenericApplicationContext('jobs');
        const driver = new InProcessJobDriver();
        context.setValue(JOB_DRIVER, driver);
        const queue = new JobQueue();
        queue.setApplicationContext(context);

        const record = await queue.enqueue({ type: 'wired' });

        expect(await driver.size()).toBe(1);
        expect(record.type).toBe('wired');
        context.close();
    });

    test('fails loud when no driver is available', async () => {
        const queue = new JobQueue();

        await expect(queue.enqueue({ type: 'x' })).rejects.toThrow(/no job driver/);
        await expect(queue.size()).rejects.toThrow(/no job driver/);
    });

    test('validates constructor arguments', () => {
        expect(() => new JobQueue({ maxAttempts: 0 })).toThrow(/maxAttempts/);
        expect(() => new JobQueue({ driver: {} as never })).toThrow(/not a JobDriver/);
    });

    test('size delegates to the driver', async () => {
        const driver = new InProcessJobDriver();
        const queue = new JobQueue({ driver });
        await queue.enqueue({ type: 'a' });
        await queue.enqueue({ type: 'b' });

        expect(await queue.size()).toBe(2);
    });
});
