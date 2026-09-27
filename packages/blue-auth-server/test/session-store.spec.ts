/**
 * @module blue-auth-server
 * @since 1.0.0
 * @author Jeff Rose
 */
import { describe, test, expect } from 'vitest';
import { InMemorySessionStore } from '../src/in-memory-session-store';

/** Test-only delay helper (Promise.withResolvers pattern). */
function delay(ms: number): Promise<void> {
    const { promise, resolve } = Promise.withResolvers<void>();
    setTimeout(resolve, ms);
    return promise;
}

describe('InMemorySessionStore', () => {
    const record = {
        principal: { id: 'u1', name: 'alice', roles: ['user'], hasRole: () => true, hasAnyRole: () => true },
        tokenVersion: 0,
        issuedAt: Date.now(),
    };

    test('kind is in-memory', () => {
        expect(new InMemorySessionStore().kind).toBe('in-memory');
    });

    test('create returns a session id and get round-trips the record', async () => {
        const store = new InMemorySessionStore();
        const id = await store.create(record, 60_000);
        expect(typeof id).toBe('string');
        expect(id.length).toBeGreaterThan(0);
        await expect(store.get(id)).resolves.toEqual(record);
    });

    test('create issues distinct ids for distinct sessions', async () => {
        const store = new InMemorySessionStore();
        const a = await store.create(record, 60_000);
        const b = await store.create(record, 60_000);
        expect(a).not.toBe(b);
    });

    test('get returns null for an unknown id', async () => {
        const store = new InMemorySessionStore();
        await expect(store.get('nope')).resolves.toBeNull();
    });

    test('expired sessions return null and are purged', async () => {
        const store = new InMemorySessionStore();
        const id = await store.create(record, 20);
        await delay(40);
        await expect(store.get(id)).resolves.toBeNull();
    });

    test('rotate replaces the id and invalidates the old one', async () => {
        const store = new InMemorySessionStore();
        const oldId = await store.create(record, 60_000);
        const newId = await store.rotate(oldId, { ...record, issuedAt: Date.now() });
        expect(newId).not.toBe(oldId);
        await expect(store.get(oldId)).resolves.toBeNull();
        await expect(store.get(newId)).resolves.toEqual({ ...record, issuedAt: expect.any(Number) });
    });

    test('rotate throws for an unknown id (fail closed)', async () => {
        const store = new InMemorySessionStore();
        await expect(store.rotate('nope', record)).rejects.toThrow(/not found/i);
    });

    test('delete invalidates the session and tolerates unknown ids', async () => {
        const store = new InMemorySessionStore();
        const id = await store.create(record, 60_000);
        await store.delete(id);
        await expect(store.get(id)).resolves.toBeNull();
        await expect(store.delete('nope')).resolves.toBeUndefined();
    });

    test('a store at the session cap rejects new sessions (SEC-4)', async () => {
        const store = new InMemorySessionStore();
        await Promise.all(Array.from({ length: 512 }, () => store.create(record, 60_000)));
        await expect(store.create(record, 60_000)).rejects.toThrow(/capacity/i);
    });

    test('expired sessions are swept at the cap, freeing a slot (SEC-4)', async () => {
        const store = new InMemorySessionStore();
        // One short-lived entry plus 511 long-lived ones fill the cap; the
        // sweep never runs during the fill (size stays below the cap), so
        // expiry timing cannot flake the fill.
        await store.create(record, 1);
        await Promise.all(Array.from({ length: 511 }, () => store.create(record, 60_000)));
        await delay(5);
        // The expired entry is reclaimed by the sweep, so a create lands.
        const fresh = await store.create(record, 60_000);
        await expect(store.get(fresh)).resolves.toEqual(record);
    });
});
