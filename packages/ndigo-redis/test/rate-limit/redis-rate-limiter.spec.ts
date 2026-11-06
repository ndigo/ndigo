/**
 * Live standalone Redis rate-limiter contracts (AD-79): shared budgets
 * across separate connections (two nodes), namespace isolation, TTL
 * windows, and the fail-closed/fail-open storage posture.
 */
// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from '@redis/client';
import { RedisConnection, type RedisClient } from '../../src';
import { RedisRateLimiter } from '../../src/rate-limit';

const url = process.env.NDIGO_REDIS_TEST_URL;
// Live integration lane — intentionally skipped unless NDIGO_REDIS_TEST_URL points at a
// running standalone Redis (see the file header); the in-process driver lane covers the rest.
const live = url === undefined ? describe.skip : describe;

live('RedisRateLimiter (live standalone Redis 6.2+)', () => {
    const connections: RedisConnection[] = [];
    const limiters: RedisRateLimiter[] = [];
    const namespaces = new Set<string>();

    async function open(onError?: 'fail-closed' | 'fail-open'): Promise<{
        limiter: RedisRateLimiter;
        connection: RedisConnection;
        namespace: string;
    }> {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const namespace = randomUUID();
        namespaces.add(namespace);
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const limiter = new RedisRateLimiter({ connection, namespace, onError });
        limiters.push(limiter);
        return { limiter, connection, namespace };
    }

    /** Second limiter on the SAME namespace over its OWN connection (a second node). */
    async function openShared(namespace: string): Promise<RedisRateLimiter> {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const limiter = new RedisRateLimiter({ connection, namespace });
        limiters.push(limiter);
        return limiter;
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
                for await (const keys of client.scanIterator({ MATCH: `ndigo:rl:${namespace}:*`, COUNT: 128 })) {
                    if (keys.length > 0) await client.del(keys);
                }
            }
        } finally {
            await client.close();
        }
        namespaces.clear();
        await Promise.all(limiters.splice(0).map((limiter) => limiter.close()));
        await Promise.all(connections.splice(0).map((connection) => connection.close()));
    });

    it('kind is redis', async () => {
        const { limiter } = await open();
        expect(limiter.kind).toBe('redis');
    });

    it('allows up to the limit and denies with the window remainder', async () => {
        const { limiter } = await open();
        const policy = { limit: 3, windowMs: 60_000 };
        for (let i = 0; i < 3; i++) {
            // oxlint-disable-next-line no-await-in-loop -- sequential consumes are the contract being asserted.
            expect((await limiter.consume('a', policy)).allowed).toBe(true);
        }
        const denied = await limiter.consume('a', policy);
        expect(denied.allowed).toBe(false);
        expect(denied.retryAfterMs).toBeGreaterThan(0);
        expect(denied.retryAfterMs).toBeLessThanOrEqual(policy.windowMs);
        // The window is fixed, not sliding: the remainder shrinks over time.
        await delay(80);
        const later = await limiter.consume('a', policy);
        expect(later.allowed).toBe(false);
        expect(later.retryAfterMs).toBeLessThan(denied.retryAfterMs);
    });

    it('a new window resets the count', async () => {
        const { limiter } = await open();
        const policy = { limit: 1, windowMs: 100 };
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
        expect((await limiter.consume('a', policy)).allowed).toBe(false);
        await delay(150);
        expect((await limiter.consume('a', policy)).allowed).toBe(true);
    });

    it('two nodes share one budget per namespace', async () => {
        const { limiter, namespace } = await open();
        const other = await openShared(namespace);
        const policy = { limit: 2, windowMs: 60_000 };
        expect((await limiter.consume('ip', policy)).allowed).toBe(true);
        expect((await other.consume('ip', policy)).allowed).toBe(true);
        expect((await limiter.consume('ip', policy)).allowed).toBe(false);
    });

    it('namespaces isolate budgets', async () => {
        const { limiter: a } = await open();
        const { limiter: b } = await open();
        const policy = { limit: 1, windowMs: 60_000 };
        expect((await a.consume('ip', policy)).allowed).toBe(true);
        expect((await b.consume('ip', policy)).allowed).toBe(true);
    });

    it('distinct keys are independent and windows never share a budget', async () => {
        const { limiter } = await open();
        const tight = { limit: 1, windowMs: 60_000 };
        const loose = { limit: 5, windowMs: 60_000 };
        expect((await limiter.consume('k', tight)).allowed).toBe(true);
        expect((await limiter.consume('k', tight)).allowed).toBe(false);
        // Same key, different window → its own budget (window is part of the key).
        expect((await limiter.consume('k', loose)).allowed).toBe(true);
        expect((await limiter.consume('other', tight)).allowed).toBe(true);
    });

    it('malformed policies fail loud without touching Redis', async () => {
        const { limiter } = await open();
        await expect(limiter.consume('k', { limit: 0, windowMs: 1000 })).rejects.toThrow(RangeError);
        await expect(limiter.consume('k', { limit: 1, windowMs: 0 })).rejects.toThrow(RangeError);
    });

    it('rejects empty or space-containing keys', async () => {
        const { limiter } = await open();
        await expect(limiter.consume('', { limit: 1, windowMs: 1000 })).rejects.toThrow();
        await expect(limiter.consume('a b', { limit: 1, windowMs: 1000 })).rejects.toThrow();
    });

    it('fail-closed (default): an unreachable store rejects the consume', async () => {
        const connection = new RedisConnection({ url: 'redis://127.0.0.1:1' }); // never connected → run rejects
        const limiter = new RedisRateLimiter({ connection, namespace: randomUUID() });
        await expect(limiter.consume('k', { limit: 1, windowMs: 1000 })).rejects.toThrow();
    });

    it('fail-open: an unreachable store logs and allows', async () => {
        const connection = new RedisConnection({ url: 'redis://127.0.0.1:1' });
        const limiter = new RedisRateLimiter({ connection, namespace: randomUUID(), onError: 'fail-open' });
        await expect(limiter.consume('k', { limit: 1, windowMs: 1000 })).resolves.toEqual({
            allowed: true,
            retryAfterMs: 0,
        });
    });

    it('a closed driver rejects operations', async () => {
        const { limiter } = await open();
        await limiter.close();
        await expect(limiter.consume('k', { limit: 1, windowMs: 1000 })).rejects.toThrow();
    });

    it('rejects a missing connection at construction', async () => {
        // @ts-expect-error -- deliberate invalid construction contract probe
        expect(() => new RedisRateLimiter({ namespace: 'x' })).toThrow(TypeError);
    });
});
