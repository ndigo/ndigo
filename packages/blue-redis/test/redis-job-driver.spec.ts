/**
 * Live standalone Redis job-driver contracts.
 *
 * @module blue-redis
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from '@redis/client';
import { RedisConnection, type RedisClient } from '../src';
import { RedisJobDriver } from '../src/jobs';

const url = process.env.BLUE_REDIS_TEST_URL;
// Live integration lane — intentionally skipped unless BLUE_REDIS_TEST_URL points at a
// running standalone Redis (see the file header); the in-process driver lane covers the rest.
const live = url === undefined ? describe.skip : describe;

live('RedisJobDriver (live standalone Redis 7.2+)', () => {
    const connections: RedisConnection[] = [];
    const drivers: RedisJobDriver[] = [];
    const namespaces = new Set<string>();

    async function open(): Promise<{ driver: RedisJobDriver; connection: RedisConnection }> {
        if (url === undefined) throw new Error('BLUE_REDIS_TEST_URL is required for live tests');
        const namespace = randomUUID();
        namespaces.add(namespace);
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const driver = new RedisJobDriver({ connection, namespace });
        drivers.push(driver);
        return { driver, connection };
    }

    /** Second handle on the SAME namespace over its own connection. */
    async function openShared(namespace: string): Promise<RedisJobDriver> {
        if (url === undefined) throw new Error('BLUE_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const driver = new RedisJobDriver({ connection, namespace });
        drivers.push(driver);
        return driver;
    }

    afterEach(async () => {
        if (url === undefined) return;
        const client: RedisClient = createClient({
            url,
            socket: { reconnectStrategy: false },
            disableOfflineQueue: true,
        });
        client.on('error', () => undefined);
        await client.connect();
        try {
            for (const namespace of namespaces) {
                // oxlint-disable-next-line no-await-in-loop -- delete each scanned chunk before continuing the scan
                for await (const keys of client.scanIterator({ MATCH: `blue:jobs:${namespace}:*`, COUNT: 128 })) {
                    if (keys.length > 0) await client.del(keys);
                }
            }
        } finally {
            await client.close();
        }
        namespaces.clear();
        await Promise.all(drivers.splice(0).map((driver) => driver.close()));
        await Promise.all(connections.splice(0).map((connection) => connection.close()));
    });

    it('enqueue → claim → complete round-trips a job', async () => {
        const { driver } = await open();

        const record = await driver.enqueue({ type: 'email.send', payload: { to: 'a@b.c' }, maxAttempts: 2 });
        expect(await driver.size()).toBe(1);

        const claimed = await driver.claim({ limit: 5, leaseMs: 1000 });
        expect(claimed).toHaveLength(1);
        expect(claimed[0]?.id).toBe(record.id);
        expect(claimed[0]?.payload).toEqual({ to: 'a@b.c' });
        expect(claimed[0]?.attempts).toBe(1);
        expect(claimed[0]?.maxAttempts).toBe(2);

        await driver.complete(record.id);
        expect(await driver.size()).toBe(0);
    });

    it('a delayed job is not claimed before its runAt', async () => {
        const { driver } = await open();
        await driver.enqueue({ type: 'later', delayMs: 50 });

        expect(await driver.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(0);
        await delay(70);
        expect(await driver.claim({ limit: 5, leaseMs: 1000 })).toHaveLength(1);
    });

    it('two handles on one namespace never claim the same job (Lua atomicity)', async () => {
        if (url === undefined) throw new Error('BLUE_REDIS_TEST_URL is required for live tests');
        const namespace = randomUUID();
        namespaces.add(namespace);
        const first = await openShared(namespace);
        const second = await openShared(namespace);
        await first.enqueue({ type: 'a' });
        await first.enqueue({ type: 'b' });
        await first.enqueue({ type: 'c' });

        const [left, right] = await Promise.all([
            first.claim({ limit: 2, leaseMs: 1000 }),
            second.claim({ limit: 2, leaseMs: 1000 }),
        ]);

        const ids = [...left, ...right].map((job) => job.id);
        expect(ids).toHaveLength(3);
        expect(new Set(ids).size).toBe(3);
    });

    it('an expired lease is reclaimed with attempts incremented', async () => {
        const { driver } = await open();
        await driver.enqueue({ type: 'crashy' });

        const [first] = await driver.claim({ limit: 1, leaseMs: 1 });
        expect(first?.attempts).toBe(1);
        await delay(10);

        const [reclaimed] = await driver.claim({ limit: 1, leaseMs: 1000 });
        expect(reclaimed?.id).toBe(first?.id);
        expect(reclaimed?.attempts).toBe(2);
    });

    it('heartbeat extends the lease', async () => {
        const { driver } = await open();
        await driver.enqueue({ type: 'slow' });
        const [job] = await driver.claim({ limit: 1, leaseMs: 40 });
        if (job === undefined) {
            throw new Error('expected the enqueued job to be claimed');
        }
        await delay(20);
        await driver.heartbeat(job.id, 1000);

        await delay(30); // past the original lease, inside the extension
        expect(await driver.claim({ limit: 1, leaseMs: 1000 })).toHaveLength(0);
    });

    it('retry reschedules with the recorded error; fail removes terminally', async () => {
        const { driver } = await open();
        const retried = await driver.enqueue({ type: 'flaky' });
        const failed = await driver.enqueue({ type: 'bad', runAt: Date.now() + 60_000 });
        await driver.claim({ limit: 2, leaseMs: 1000 });

        await driver.retry(retried.id, 0, 'boom');
        const [job] = await driver.claim({ limit: 1, leaseMs: 1000 });
        expect(job?.id).toBe(retried.id);
        expect(job?.lastError).toBe('boom');

        await driver.fail(failed.id, 'no handler');
        expect(await driver.size()).toBe(1);
    });

    it('size counts ready plus leased jobs', async () => {
        const { driver } = await open();
        await driver.enqueue({ type: 'a' });
        await driver.enqueue({ type: 'b', runAt: Date.now() + 60_000 });

        expect(await driver.size()).toBe(2);
        await driver.claim({ limit: 1, leaseMs: 1000 });
        expect(await driver.size()).toBe(2); // running counts as pending
    });

    it('a closed handle rejects operations; the borrowed connection stays usable', async () => {
        const { driver, connection } = await open();
        await driver.close();

        await expect(driver.enqueue({ type: 'x' })).rejects.toThrow(/closed/);
        await expect(connection.run(async (client) => client.ping())).resolves.toBe('PONG');
    });

    it('validates its constructor and claim window', async () => {
        expect(() => new RedisJobDriver({ namespace: 'x' } as never)).toThrow(/connection/);
        const { driver, connection } = await open();
        expect(() => new RedisJobDriver({ connection, namespace: 'bad namespace' })).toThrow(/namespace/);
        await expect(driver.claim({ limit: 0, leaseMs: 1 })).rejects.toThrow(/limit/);
    });
});
