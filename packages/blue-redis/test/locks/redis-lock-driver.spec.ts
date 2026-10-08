/**
 * Live standalone Redis lock-driver contracts (AD-73): lease lifecycle,
 * fencing tokens across separate connections, and stale-holder isolation.
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
import { FrameworkError } from '@blue/core';
import { RedisConnection, type RedisClient } from '../../src';
import { RedisLockDriver } from '../../src/locks';

const url = process.env.BLUE_REDIS_TEST_URL;
// Live integration lane — intentionally skipped unless BLUE_REDIS_TEST_URL points at a
// running standalone Redis (see the file header); the in-process driver lane covers the rest.
const live = url === undefined ? describe.skip : describe;

live('RedisLockDriver (live standalone Redis 6.2+)', () => {
    const connections: RedisConnection[] = [];
    const drivers: RedisLockDriver[] = [];
    const namespaces = new Set<string>();

    async function open(): Promise<{ driver: RedisLockDriver; connection: RedisConnection; namespace: string }> {
        if (url === undefined) throw new Error('BLUE_REDIS_TEST_URL is required for live tests');
        const namespace = randomUUID();
        namespaces.add(namespace);
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const driver = new RedisLockDriver({ connection, namespace });
        drivers.push(driver);
        return { driver, connection, namespace };
    }

    /** Second driver on the SAME namespace over its OWN connection (a second node). */
    async function openShared(namespace: string): Promise<RedisLockDriver> {
        if (url === undefined) throw new Error('BLUE_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const driver = new RedisLockDriver({ connection, namespace });
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
                for await (const keys of client.scanIterator({ MATCH: `blue:locks:${namespace}:*`, COUNT: 128 })) {
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

    it('acquire → release → re-acquire cycles with monotonic tokens', async () => {
        const { driver } = await open();
        const first = await driver.acquire('slot', { ttlMs: 10_000 });
        if (first === null) throw new Error('expected the first acquisition');
        expect(first.token).toBe(1);
        expect(await first.isHeld()).toBe(true);

        expect(await driver.acquire('slot', { ttlMs: 10_000 })).toBeNull();
        expect(await first.release()).toBe(true);
        expect(await first.isHeld()).toBe(false);

        const second = await driver.acquire('slot', { ttlMs: 10_000 });
        if (second === null) throw new Error('expected the second acquisition');
        // Monotonic per key — the counter also advances on contention attempts,
        // so acquisitions may carry gaps.
        expect(second.token).toBeGreaterThan(first.token);
    });

    it('expires leases — the next acquirer wins and the stale holder is fenced', async () => {
        const { driver } = await open();
        const stale = await driver.acquire('gate', { ttlMs: 400 });
        if (stale === null) throw new Error('expected the first acquisition');

        await delay(500); // lease expires on the wire
        const successor = await driver.acquire('gate', { ttlMs: 10_000 });
        if (successor === null) throw new Error('expected the second acquisition');

        // Fencing: the stale holder can neither renew nor release the successor.
        expect(await stale.isHeld()).toBe(false);
        expect(await stale.renew(10_000)).toBe(false);
        expect(await stale.release()).toBe(false);
        expect(await successor.isHeld()).toBe(true);
    });

    it('renew extends the lease past its original expiry', async () => {
        const { driver } = await open();
        const handle = await driver.acquire('window', { ttlMs: 800 });
        if (handle === null) throw new Error('expected the acquisition');

        await delay(500); // inside the original lease — renew before it lapses
        expect(await handle.renew(2_000)).toBe(true);

        await delay(1_000); // past the original expiry, inside the renewal
        expect(await handle.isHeld()).toBe(true);
    });

    it('a second node on the same namespace coordinates through the key', async () => {
        const { driver, namespace } = await open();
        const nodeB = await openShared(namespace);

        const heldByA = await driver.acquire('shared-key', { ttlMs: 10_000 });
        if (heldByA === null) throw new Error('expected node A to win');
        expect(await nodeB.acquire('shared-key', { ttlMs: 10_000 })).toBeNull();

        expect(await heldByA.release()).toBe(true);
        const heldByB = await nodeB.acquire('shared-key', { ttlMs: 10_000 });
        if (heldByB === null) throw new Error('expected node B to win after release');
        expect(heldByB.token).toBeGreaterThan(heldByA.token);
    });

    it('isolates lock namespaces on a shared Redis', async () => {
        const { driver, namespace } = await open();
        const other = await openShared(`${namespace}-other`);

        const first = await driver.acquire('same', { ttlMs: 10_000 });
        if (first === null) throw new Error('expected the acquire');
        expect(await other.acquire('same', { ttlMs: 10_000 })).not.toBeNull();
    });

    it('closed drivers reject operations', async () => {
        const { driver } = await open();
        await driver.close();
        await expect(driver.acquire('x', { ttlMs: 1_000 })).rejects.toThrow(FrameworkError);
    });

    it('validates constructor options', () => {
        expect(
            () => new RedisLockDriver({ connection: undefined as unknown as RedisConnection, namespace: 'x' })
        ).toThrow(TypeError);
        expect(
            () => new RedisLockDriver({ connection: null as unknown as RedisConnection, namespace: 'bad space' })
        ).toThrow(TypeError);
    });
});
