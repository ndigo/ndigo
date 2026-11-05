/**
 * Live standalone Redis cache and lifecycle contracts.
 *
 * @since 1.0.0
 * @author Jeff Rose
 */
// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { randomUUID } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import { createClient } from '@redis/client';
import { CacheMiss, type Cache } from '@ndigo/cache';
import { ContextToken } from '@ndigo/factory';
import { RedisConnection, type RedisClient } from '../src';
import { RedisCache, RedisCacheManager, type RedisCacheManagerOptions } from '../src/cache';

const url = process.env.NDIGO_REDIS_TEST_URL;
// Live integration lane — intentionally skipped unless NDIGO_REDIS_TEST_URL points at a
// running standalone Redis (see the file header); the in-memory unit lane covers the rest.
const live = url === undefined ? describe.skip : describe;

// Independent fixture encoding for raw corruption/expiry injection into our own namespace.
function fixtureKey(namespace: string, cache: string, key: string): string {
    const parts = [namespace, cache, key].map((part) => {
        let encoded = '';
        for (let i = 0; i < part.length; i++) encoded += part.charCodeAt(i).toString(16).padStart(4, '0');
        return encoded;
    });
    return 'ndigo:cache:v1:' + parts.join(':');
}
live('Redis cache (live standalone Redis 7.2+)', () => {
    const managers: RedisCacheManager[] = [];
    const clients: RedisClient[] = [];
    const connections: RedisConnection[] = [];
    const stores: RedisCache[] = [];

    async function manager(namespace: string, defaults?: { defaultTtl?: number }): Promise<RedisCacheManager> {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const result = new RedisCacheManager({ url, namespace, defaults });
        managers.push(result);
        await result.connect();
        return result;
    }

    async function raw(): Promise<RedisClient> {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const client = createClient({ url, socket: { reconnectStrategy: false }, disableOfflineQueue: true });
        client.on('error', () => undefined);
        clients.push(client);
        await client.connect();
        return client;
    }

    afterEach(async () => {
        // Clear all namespace data before shutting down any client it depends on.
        await Promise.all(stores.splice(0).map((store) => store.clear().catch(() => undefined)));
        await Promise.all(managers.splice(0).map((item) => item.close()));
        await Promise.all(connections.splice(0).map((item) => item.close()));
        await Promise.all(
            clients
                .splice(0)
                .filter((item) => item.isOpen)
                .map((item) => item.close())
        );
    });

    it('shares values across independent clients and isolates app/cache/glob and UTF-16 names', async () => {
        const namespace = randomUUID() + ':*?[x]';
        const first = await manager(namespace);
        const second = await manager(namespace);
        const otherApp = await manager(namespace + ':other');
        const a = first.getCache('users:*');
        const b = second.getCache('users:*');
        const sibling = first.getCache('users');
        const foreign = otherApp.getCache('users:*');
        stores.push(a, sibling, foreign);
        expect(second.hasCache('unacquired')).toBe(false);
        const token = new ContextToken<Cache<unknown>>('users:*');
        expect(first.getCache(token)).toBe(a);
        expect(first.hasCache(token)).toBe(true);
        await a.set('key:*', { roles: ['reader'], active: true, count: 4, nullable: null });
        expect(await b.get('key:*')).toEqual({ roles: ['reader'], active: true, count: 4, nullable: null });
        await a.set('undefined', undefined);
        expect(await b.get('undefined')).toBeUndefined();
        expect(await b.has('undefined')).toBe(true);
        expect(await b.get('absent')).toBe(CacheMiss.INSTANCE);
        await b.set('key:*', 'overwritten');
        expect(await a.get('key:*')).toBe('overwritten');
        await a.set('\ud800', 'surrogate');
        await a.set('\ufffd', 'replacement');
        expect(await b.get('\ud800')).toBe('surrogate');
        expect(await b.get('\ufffd')).toBe('replacement');
        await sibling.set('key:*', 'sibling');
        await foreign.set('key:*', 'other application');
        expect(await a.size()).toBe(4);
        expect(await b.delete('key:*')).toBe(true);
        expect(await a.delete('key:*')).toBe(false);
        await a.clear();
        expect(await b.size()).toBe(0);
        expect(await b.get('undefined')).toBe(CacheMiss.INSTANCE);
        expect(await sibling.get('key:*')).toBe('sibling');
        expect(await foreign.get('key:*')).toBe('other application');
    });

    it('handles multiple SCAN pages and bounded clear batches without deleting neighboring data', async () => {
        const owner = await manager(randomUUID());
        const cache = owner.getCache('large');
        const neighbor = owner.getCache('large:*');
        stores.push(cache, neighbor);
        await Promise.all(Array.from({ length: 350 }, (_, i) => cache.set(String(i), i)));
        await neighbor.set('0', 'keep');
        expect(await cache.size()).toBe(350);
        await cache.clear();
        expect(await cache.size()).toBe(0);
        expect(await neighbor.get('0')).toBe('keep');
    });

    it('uses server expiry with millisecond precision, per-entry override and overwrite removing TTL', async () => {
        const namespace = randomUUID();
        const a = (await manager(namespace, { defaultTtl: 40.1 })).getCache('ttl');
        const b = (await manager(namespace)).getCache('ttl');
        stores.push(a);
        await a.set('default', 'short');
        await a.set('override', 'long', 5_000.1);
        await a.set('persistent', 'old', 40);
        await b.set('persistent', 'new');
        const inspector = await raw();
        const remaining = await inspector.pTTL(fixtureKey(namespace, 'ttl', 'override'));
        expect(remaining).toBeGreaterThan(0);
        expect(remaining).toBeLessThanOrEqual(5_001);
        const deadline = Date.now() + 2_000;
        // eslint-disable-next-line no-await-in-loop -- expiry polling must observe each prior server result
        while ((await b.has('default')) && Date.now() < deadline) await delay(10);
        expect(await b.get('default')).toBe(CacheMiss.INSTANCE);
        expect(await b.delete('default')).toBe(false);
        expect(await b.size()).toBe(2);
        expect(await b.get('persistent')).toBe('new');
        expect(await b.get('override')).toBe('long');
        await Promise.all(
            [0, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1].map((ttl) =>
                expect(a.set('invalid', 'x', ttl)).rejects.toThrow(TypeError)
            )
        );
    });

    it('rejects values JSON cannot faithfully represent, without mutating an existing entry', async () => {
        const cache = (await manager(randomUUID())).getCache('codec');
        stores.push(cache);
        const cycle: unknown[] = [];
        cycle.push(cycle);
        const accessor = Object.defineProperty({}, 'field', {
            enumerable: true,
            get() {
                throw new Error('must not invoke');
            },
        });
        const sparse = new Array(2);
        const values = [
            NaN,
            Infinity,
            -0,
            1n,
            () => 1,
            Symbol('x'),
            new Date(),
            new Map(),
            new Set(),
            /x/,
            CacheMiss.INSTANCE,
            cycle,
            sparse,
            accessor,
            { nested: undefined },
            {
                toJSON() {
                    return 1;
                },
            },
            { [Symbol('field')]: 1 },
            Object.defineProperty({}, 'hidden', { value: 1 }),
        ];
        await cache.set('stable', 'before');
        await Promise.all(values.map((value) => expect(cache.set('stable', value)).rejects.toThrow(TypeError)));
        expect(await cache.get('stable')).toBe('before');
        await cache.set('json', [null, true, 'string', 42, { field: ['nested'] }]);
        expect(await cache.get('json')).toEqual([null, true, 'string', 42, { field: ['nested'] }]);
    });

    it('rejects corruption and actual Redis WRONGTYPE errors rather than treating them as misses', async () => {
        const namespace = randomUUID();
        const cache = (await manager(namespace)).getCache('corrupt');
        stores.push(cache);
        const client = await raw();
        const target = fixtureKey(namespace, 'corrupt', 'key');
        await cache.set('key', 'initial');
        for (const corrupt of ['not json', '["ndigo-cache",2,"undefined"]', '["ndigo-cache",1,"value",1e999]', '{}']) {
            // eslint-disable-next-line no-await-in-loop -- replace the same corrupt entry only after prior assertions
            await client.set(target, corrupt);
            // eslint-disable-next-line no-await-in-loop -- read must follow this iteration's corruption write
            await expect(cache.get('key')).rejects.toThrow(TypeError);
            // eslint-disable-next-line no-await-in-loop -- has must observe this corruption before the next replacement
            await expect(cache.has('key')).rejects.toThrow(TypeError);
        }
        await client.del(target);
        await client.lPush(target, 'not a string');
        await expect(cache.get('key')).rejects.toThrow('WRONGTYPE');
        expect(await cache.delete('key')).toBe(true);
    });

    it('requires readiness, drains accepted operations and closes owned clients idempotently', async () => {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        connections.push(connection);
        const cache = new RedisCache(connection, { namespace: randomUUID(), cacheName: 'lifecycle' });
        await expect(cache.set('key', 'value')).rejects.toThrow('not ready');
        await connection.connect();
        await connection.connect();
        let release!: () => void;
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        let entered!: () => void;
        const started = new Promise<void>((resolve) => {
            entered = resolve;
        });
        let owned: RedisClient | undefined;
        const pending = connection.run(async (client) => {
            owned = client;
            entered();
            await gate;
            await client.ping();
        });
        await started;
        const close = connection.close();
        expect(connection.close()).toBe(close);
        await expect(cache.get('key')).rejects.toThrow('closed');
        release();
        await pending;
        await close;
        if (owned === undefined) throw new Error('Tracked operation never acquired the client');
        expect(owned.isOpen).toBe(false);
        await expect(connection.connect()).rejects.toThrow('closed');
    });

    it('leaves borrowed clients usable, rejects not-ready/prefixed clients and backend disconnection', async () => {
        const client = await raw();
        const manager = new RedisCacheManager({ client, namespace: randomUUID() });
        managers.push(manager);
        await manager.connect();
        const cache = manager.getCache('borrowed');
        await cache.set('value', 1);
        await cache.clear();
        await manager.close();
        expect(await client.ping()).toBe('PONG');
        expect(() => manager.getCache('other')).toThrow('closed');
        await expect(cache.get('value')).rejects.toThrow('closed');
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const notReady = createClient({ url });
        expect(() => new RedisConnection({ client: notReady })).toThrow('ready');
        const prefixed = createClient({ url, keyPrefix: 'bad:' });
        prefixed.on('error', () => undefined);
        clients.push(prefixed);
        await prefixed.connect();
        expect(() => new RedisConnection({ client: prefixed })).toThrow('keyPrefix');
        const disconnected = await raw();
        const borrowed = new RedisConnection({ client: disconnected });
        connections.push(borrowed);
        await disconnected.close();
        const failed = new RedisCache(borrowed, { namespace: randomUUID(), cacheName: 'failed' });
        await expect(failed.get('missing')).rejects.toThrow('not ready');
    });

    it('observes owned socket loss and never converts outages into misses or reconnects implicitly', async () => {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const connection = new RedisConnection({ url });
        connections.push(connection);
        await connection.connect();
        const namespace = randomUUID();
        const cache = new RedisCache(connection, { namespace, cacheName: 'outage' });
        await cache.set('key', 'visible');
        const clientId = await connection.run((client) => client.clientId());
        const inspector = await raw();
        expect(await inspector.clientKill({ filter: 'ID', id: clientId })).toBe(1);
        const deadline = Date.now() + 2_000;
        // eslint-disable-next-line no-await-in-loop -- wait for the socket-loss event before asserting the error
        while (connection.lastError === undefined && Date.now() < deadline) await delay(10);
        expect(connection.lastError).toBeInstanceOf(Error);
        await expect(cache.get('key')).rejects.toThrow();
        await connection.close();
        const replacement = (await manager(namespace)).getCache('outage');
        stores.push(replacement);
        expect(await replacement.get('key')).toBe('visible');
    });

    it('reports real startup database errors and permits awaited close after failed connect', async () => {
        if (url === undefined) throw new Error('NDIGO_REDIS_TEST_URL is required for live tests');
        const invalid = new URL(url);
        invalid.pathname = '/2147483647'; // Redis SELECT rejects an out-of-range database.
        const connection = new RedisConnection({ url: invalid.toString(), connectTimeout: 1_000 });
        connections.push(connection);
        const startup = connection.connect();
        await expect(startup).rejects.toThrow();
        expect(connection.connect()).toBe(startup);
        expect(connection.lastError).toBeInstanceOf(Error);
        await connection.close();
    });
});

describe('Redis explicit configuration', () => {
    it('rejects implicit localhost, invalid URLs, TTL and unsupported memory eviction configuration', () => {
        expect(() => new RedisConnection({ url: '' })).toThrow(TypeError);
        expect(() => new RedisConnection({ url: 'https://example.com' })).toThrow(TypeError);
        expect(() => new RedisCacheManager({ url: 'redis://127.0.0.1', namespace: '' })).toThrow(TypeError);
        for (const defaults of [{ defaultTtl: 0 }, { defaultTtl: Infinity }, { maxSize: 10 }, { eviction: 'lru' }]) {
            expect(
                () =>
                    new RedisCacheManager({
                        url: 'redis://127.0.0.1',
                        namespace: 'test',
                        defaults,
                    } as RedisCacheManagerOptions)
            ).toThrow(TypeError);
        }
    });
});
