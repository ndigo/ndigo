/**
 */
import { describe, test, expect } from 'vitest';
import { delay } from '@ndigo/test';
import { InMemorySessionStore } from '../src/in-memory-session-store';

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
        const rotated = await store.rotate(oldId, { ...record, issuedAt: Date.now() });
        expect(rotated.id).not.toBe(oldId);
        await expect(store.get(oldId)).resolves.toBeNull();
        await expect(store.get(rotated.id)).resolves.toEqual({ ...record, issuedAt: expect.any(Number) });
    });

    test('rotate preserves the remaining TTL and reports the effective expiry (COR-13)', async () => {
        const store = new InMemorySessionStore();
        const id = await store.create(record, 200);
        await delay(100); // burn half the 200ms window
        const rotated = await store.rotate(id, { ...record, issuedAt: Date.now() });
        const remainingMs = rotated.expiresAt - Date.now();
        // Effective expiry preserves the original absolute window...
        expect(remainingMs).toBeGreaterThan(40);
        // …and is far short of a fresh full 200ms TTL.
        expect(remainingMs).toBeLessThan(150);
        await expect(store.get(rotated.id)).resolves.toEqual({ ...record, issuedAt: expect.any(Number) });
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

    test('deleteForUser removes only the account live sessions and reports the count (AD-68)', async () => {
        const store = new InMemorySessionStore();
        const alice = { ...record, principal: { ...record.principal, id: 'alice' } };
        const bob = { ...record, principal: { ...record.principal, id: 'bob' } };
        const a1 = await store.create(alice, 60_000);
        const a2 = await store.create(alice, 60_000);
        const b1 = await store.create(bob, 60_000);

        await expect(store.deleteForUser('alice')).resolves.toBe(2);
        await expect(store.get(a1)).resolves.toBeNull();
        await expect(store.get(a2)).resolves.toBeNull();
        await expect(store.get(b1)).resolves.toEqual(bob);
        // Idempotent for an account with nothing left.
        await expect(store.deleteForUser('alice')).resolves.toBe(0);
    });

    test('deleteForUser purges expired entries without counting them as live', async () => {
        const store = new InMemorySessionStore();
        const alice = { ...record, principal: { ...record.principal, id: 'alice' } };
        await store.create(alice, 1);
        await delay(5);
        const live = await store.create(alice, 60_000);

        await expect(store.deleteForUser('alice')).resolves.toBe(1);
        await expect(store.get(live)).resolves.toBeNull();
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
